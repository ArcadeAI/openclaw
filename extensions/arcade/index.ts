/**
 * Moltbot Arcade.dev Plugin
 *
 * Provides integration with Arcade.dev for 100+ authorized tools including:
 * - Gmail, Google Calendar, Google Drive, Google Docs
 * - Slack, Discord, Microsoft Teams
 * - GitHub, Figma, Linear, Jira
 * - Stripe, HubSpot, Salesforce
 * - And many more...
 *
 * Features:
 * - Dynamic tool registration from Arcade API
 * - Automatic OAuth authorization handling
 * - JIT (just-in-time) authorization prompts
 * - Tool filtering and allowlists
 * - CLI commands for management
 * - Gateway RPC methods
 *
 * Configuration:
 * ```json5
 * {
 *   plugins: {
 *     entries: {
 *       arcade: {
 *         enabled: true,
 *         config: {
 *           apiKey: "${ARCADE_API_KEY}",
 *           userId: "user@example.com",
 *           tools: {
 *             allow: ["Gmail.*", "Slack.*", "GitHub.*"]
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 * ```
 */

import { Type } from "@sinclair/typebox";
import type { MoltbotPluginApi } from "clawdbot/plugin-sdk";

import { arcadeConfigSchema, resolveArcadeConfig, type ArcadeConfig } from "./src/config.js";
import { createArcadeClient, type ArcadeClient } from "./src/client.js";
import {
  registerArcadeTools,
  registerStaticTools,
  type RegisteredTool,
} from "./src/tools.js";
import { registerArcadeCli } from "./src/cli.js";

// ============================================================================
// Plugin State
// ============================================================================

let arcadeClient: ArcadeClient | null = null;
let registeredTools: RegisteredTool[] = [];

// ============================================================================
// Plugin Definition
// ============================================================================

const arcadePlugin = {
  id: "arcade",
  name: "Arcade.dev",
  description: "Connect to Arcade.dev for 100+ authorized tools (Gmail, Slack, GitHub, etc.)",
  configSchema: arcadeConfigSchema,

  async register(api: MoltbotPluginApi) {
    const config = resolveArcadeConfig(api.pluginConfig);

    if (!config.enabled) {
      api.logger.info("[arcade] Plugin disabled");
      return;
    }

    // Create client
    arcadeClient = createArcadeClient(config);

    api.logger.info(
      `[arcade] Plugin initializing (baseUrl: ${config.baseUrl}, userId: ${config.userId || "not set"})`,
    );

    // ========================================================================
    // Register Static Tools (always available)
    // ========================================================================

    const staticTools = registerStaticTools(api, arcadeClient, config);
    registeredTools.push(...staticTools);

    // ========================================================================
    // Register Dynamic Tools (from Arcade API)
    // ========================================================================

    if (arcadeClient.isConfigured()) {
      try {
        const dynamicTools = await registerArcadeTools(api, arcadeClient, config);
        registeredTools.push(...dynamicTools);
      } catch (err) {
        api.logger.warn(
          `[arcade] Failed to load dynamic tools: ${err instanceof Error ? err.message : String(err)}`,
        );
        api.logger.info("[arcade] Falling back to static tools only");
      }
    } else {
      api.logger.warn("[arcade] API key not configured, using static tools only");
      api.logger.info("[arcade] Set ARCADE_API_KEY or plugins.entries.arcade.config.apiKey");
    }

    // ========================================================================
    // Gateway RPC Methods
    // ========================================================================

    const sendError = (respond: (ok: boolean, payload?: unknown) => void, err: unknown) => {
      respond(false, { error: err instanceof Error ? err.message : String(err) });
    };

    // arcade.tools.list - List available tools
    api.registerGatewayMethod("arcade.tools.list", async ({ params, respond }) => {
      try {
        if (!arcadeClient?.isConfigured()) {
          respond(false, { error: "Arcade API key not configured" });
          return;
        }

        const toolkit = typeof params?.toolkit === "string" ? params.toolkit : undefined;
        const tools = await arcadeClient.listTools({ toolkit, forceRefresh: true });

        respond(true, {
          count: tools.length,
          tools: tools.map((t) => ({
            name: t.name,
            description: t.description,
            toolkit: t.toolkit,
            requires_auth: t.requires_auth,
          })),
        });
      } catch (err) {
        sendError(respond, err);
      }
    });

    // arcade.tools.execute - Execute a tool
    api.registerGatewayMethod("arcade.tools.execute", async ({ params, respond }) => {
      try {
        if (!arcadeClient?.isConfigured()) {
          respond(false, { error: "Arcade API key not configured" });
          return;
        }

        const toolName = typeof params?.tool === "string" ? params.tool : "";
        const input = (params?.input as Record<string, unknown>) ?? {};

        if (!toolName) {
          respond(false, { error: "tool name required" });
          return;
        }

        const result = await arcadeClient.executeWithAuth(toolName, input, {
          onAuthRequired: async () => false,
        });

        if (result.authorization_required) {
          respond(true, {
            success: false,
            authorization_required: true,
            authorization_url: result.authorization_url,
          });
          return;
        }

        respond(true, {
          success: result.success,
          output: result.output,
          error: result.error,
        });
      } catch (err) {
        sendError(respond, err);
      }
    });

    // arcade.auth.status - Check auth status
    api.registerGatewayMethod("arcade.auth.status", async ({ params, respond }) => {
      try {
        if (!arcadeClient?.isConfigured()) {
          respond(false, { error: "Arcade API key not configured" });
          return;
        }

        const toolName = typeof params?.tool === "string" ? params.tool : "";

        if (toolName) {
          const status = await arcadeClient.authorize(toolName);
          respond(true, status);
        } else {
          const connections = await arcadeClient.listUserConnections();
          respond(true, { connections });
        }
      } catch (err) {
        sendError(respond, err);
      }
    });

    // arcade.auth.authorize - Initiate authorization
    api.registerGatewayMethod("arcade.auth.authorize", async ({ params, respond }) => {
      try {
        if (!arcadeClient?.isConfigured()) {
          respond(false, { error: "Arcade API key not configured" });
          return;
        }

        const toolName = typeof params?.tool === "string" ? params.tool : "";

        if (!toolName) {
          respond(false, { error: "tool name required" });
          return;
        }

        const result = await arcadeClient.authorize(toolName);
        respond(true, result);
      } catch (err) {
        sendError(respond, err);
      }
    });

    // arcade.status - Plugin status
    api.registerGatewayMethod("arcade.status", async ({ params, respond }) => {
      try {
        const isHealthy = arcadeClient?.isConfigured()
          ? await arcadeClient.health().then(() => true).catch(() => false)
          : false;

        respond(true, {
          enabled: config.enabled,
          configured: arcadeClient?.isConfigured() ?? false,
          healthy: isHealthy,
          userId: arcadeClient?.getUserId() ?? null,
          registeredTools: registeredTools.length,
          toolkits: [...new Set(registeredTools.map((t) => t.toolkit))],
        });
      } catch (err) {
        sendError(respond, err);
      }
    });

    // ========================================================================
    // Plugin Commands (auto-reply, no AI)
    // ========================================================================

    api.registerCommand({
      name: "arcade",
      description: "Show Arcade plugin status",
      acceptsArgs: true,
      requireAuth: true,
      handler: async (ctx) => {
        const args = ctx.args?.trim().toLowerCase();

        // /arcade status
        if (!args || args === "status") {
          const isConfigured = arcadeClient?.isConfigured() ?? false;
          const toolCount = registeredTools.length;
          const toolkits = [...new Set(registeredTools.map((t) => t.toolkit))];

          return {
            text: [
              `Arcade.dev Plugin Status`,
              `• Enabled: ${config.enabled}`,
              `• Configured: ${isConfigured}`,
              `• User ID: ${config.userId || "(not set)"}`,
              `• Registered Tools: ${toolCount}`,
              `• Toolkits: ${toolkits.join(", ") || "none"}`,
            ].join("\n"),
          };
        }

        // /arcade tools
        if (args === "tools" || args.startsWith("tools ")) {
          const toolkit = args.replace(/^tools\s*/, "").trim() || undefined;
          const filtered = toolkit
            ? registeredTools.filter((t) => t.toolkit.toLowerCase().includes(toolkit))
            : registeredTools;

          if (filtered.length === 0) {
            return { text: `No tools found${toolkit ? ` for "${toolkit}"` : ""}` };
          }

          const grouped = new Map<string, RegisteredTool[]>();
          for (const tool of filtered) {
            const list = grouped.get(tool.toolkit) ?? [];
            list.push(tool);
            grouped.set(tool.toolkit, list);
          }

          const lines = [`Arcade Tools (${filtered.length} total):`];
          for (const [tk, tools] of grouped.entries()) {
            lines.push(`\n${tk}:`);
            for (const tool of tools.slice(0, 5)) {
              lines.push(`  • ${tool.arcadeName}`);
            }
            if (tools.length > 5) {
              lines.push(`  ... and ${tools.length - 5} more`);
            }
          }

          return { text: lines.join("\n") };
        }

        return {
          text: `Unknown command: /arcade ${args}\nUsage: /arcade [status|tools]`,
        };
      },
    });

    // ========================================================================
    // Hooks: JIT Authorization
    // ========================================================================

    if (config.autoAuth) {
      api.on("before_tool_call", async (event) => {
        // Check if this is an Arcade tool
        const toolInfo = registeredTools.find((t) => t.name === event.toolName);
        if (!toolInfo || !toolInfo.requiresAuth) return;

        if (!arcadeClient?.isConfigured()) return;

        try {
          // Check authorization status
          const authStatus = await arcadeClient.authorize(toolInfo.arcadeName);

          if (authStatus.status !== "completed" && authStatus.authorization_url) {
            api.logger.info(
              `[arcade] Tool ${toolInfo.arcadeName} requires authorization`,
            );

            // Return a block response with the auth URL
            return {
              block: true,
              blockReason: `Authorization required for ${toolInfo.arcadeName}. Please visit: ${authStatus.authorization_url}`,
            };
          }
        } catch (err) {
          api.logger.warn(
            `[arcade] Failed to check auth for ${toolInfo.arcadeName}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      });

      api.on("after_tool_call", async (event) => {
        // Track tool usage for analytics
        const toolInfo = registeredTools.find((t) => t.name === event.toolName);
        if (!toolInfo) return;

        api.logger.info(
          `[arcade] Tool ${toolInfo.arcadeName} executed (success: ${!event.error})`,
        );
      });
    }

    // ========================================================================
    // CLI Commands
    // ========================================================================

    api.registerCli(
      ({ program }) =>
        registerArcadeCli(program, {
          client: arcadeClient!,
          config,
          logger: api.logger,
        }),
      { commands: ["arcade"] },
    );

    // ========================================================================
    // HTTP Webhook Handler
    // ========================================================================

    api.registerHttpRoute({
      path: "/arcade/webhook",
      handler: async (req, res) => {
        // Handle Arcade webhook events (e.g., auth completed)
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        let body = "";
        for await (const chunk of req) {
          body += chunk;
        }

        try {
          const event = JSON.parse(body);
          api.logger.info(`[arcade] Webhook event: ${event.type}`);

          // Handle different event types
          switch (event.type) {
            case "auth.completed":
              api.logger.info(
                `[arcade] Authorization completed for user: ${event.user_id}`,
              );
              // Clear tools cache to refresh auth state
              arcadeClient?.clearCache();
              break;

            case "auth.revoked":
              api.logger.info(
                `[arcade] Authorization revoked for user: ${event.user_id}`,
              );
              arcadeClient?.clearCache();
              break;

            default:
              api.logger.info(`[arcade] Unknown webhook event: ${event.type}`);
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          api.logger.error(
            `[arcade] Webhook error: ${err instanceof Error ? err.message : String(err)}`,
          );
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid request" }));
        }
      },
    });

    // ========================================================================
    // Service Lifecycle
    // ========================================================================

    api.registerService({
      id: "arcade",
      start: async () => {
        api.logger.info(
          `[arcade] Service started (${registeredTools.length} tools registered)`,
        );

        // Health check
        if (arcadeClient?.isConfigured()) {
          try {
            await arcadeClient.health();
            api.logger.info("[arcade] API health check passed");
          } catch (err) {
            api.logger.warn(
              `[arcade] API health check failed: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
      },
      stop: async () => {
        api.logger.info("[arcade] Service stopped");
        arcadeClient = null;
        registeredTools = [];
      },
    });
  },
};

export default arcadePlugin;
