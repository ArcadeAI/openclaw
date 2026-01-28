/**
 * Arcade CLI Commands
 *
 * Provides CLI commands for managing Arcade integration:
 * - arcade tools list
 * - arcade tools search
 * - arcade auth status
 * - arcade auth login
 * - arcade config show
 */

import type { Command } from "commander";
import type { ArcadeClient } from "./client.js";
import type { ArcadeConfig, ArcadeToolkitId, ARCADE_TOOLKITS } from "./config.js";

// ============================================================================
// Types
// ============================================================================

export type ArcadeCliContext = {
  client: ArcadeClient;
  config: ArcadeConfig;
  logger: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
};

// ============================================================================
// CLI Registration
// ============================================================================

export function registerArcadeCli(
  program: Command,
  ctx: ArcadeCliContext,
): void {
  const { client, config, logger } = ctx;

  const arcade = program
    .command("arcade")
    .description("Arcade.dev tool integration commands");

  // ==========================================================================
  // Tools Commands
  // ==========================================================================

  const tools = arcade
    .command("tools")
    .description("Manage Arcade tools");

  tools
    .command("list")
    .description("List available Arcade tools")
    .option("-t, --toolkit <name>", "Filter by toolkit (e.g., gmail, slack)")
    .option("-l, --limit <n>", "Maximum number of tools", "50")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          logger.info("Set ARCADE_API_KEY or run: moltbot config set plugins.entries.arcade.config.apiKey=\"<key>\"");
          return;
        }

        const tools = await client.listTools({
          toolkit: opts.toolkit,
          limit: parseInt(opts.limit, 10),
          forceRefresh: true,
        });

        if (opts.json) {
          console.log(JSON.stringify(tools, null, 2));
          return;
        }

        if (tools.length === 0) {
          logger.info("No tools found");
          return;
        }

        // Group by toolkit
        const byToolkit = new Map<string, typeof tools>();
        for (const tool of tools) {
          const list = byToolkit.get(tool.toolkit) ?? [];
          list.push(tool);
          byToolkit.set(tool.toolkit, list);
        }

        console.log(`\nFound ${tools.length} tools:\n`);

        for (const [toolkit, toolList] of byToolkit.entries()) {
          console.log(`${toolkit} (${toolList.length} tools):`);
          for (const tool of toolList.slice(0, 10)) {
            const auth = tool.requires_auth ? " [auth]" : "";
            console.log(`  - ${tool.name}${auth}`);
            if (tool.description) {
              console.log(`    ${tool.description.slice(0, 60)}${tool.description.length > 60 ? "..." : ""}`);
            }
          }
          if (toolList.length > 10) {
            console.log(`  ... and ${toolList.length - 10} more`);
          }
          console.log();
        }
      } catch (err) {
        logger.error(`Failed to list tools: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  tools
    .command("search <query>")
    .description("Search for Arcade tools by name or description")
    .option("--json", "Output as JSON")
    .action(async (query, opts) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        const allTools = await client.listTools({ forceRefresh: true });
        const lowerQuery = query.toLowerCase();

        const matches = allTools.filter(
          (t) =>
            t.name.toLowerCase().includes(lowerQuery) ||
            t.description?.toLowerCase().includes(lowerQuery) ||
            t.toolkit.toLowerCase().includes(lowerQuery),
        );

        if (opts.json) {
          console.log(JSON.stringify(matches, null, 2));
          return;
        }

        if (matches.length === 0) {
          logger.info(`No tools found matching "${query}"`);
          return;
        }

        console.log(`\nFound ${matches.length} tools matching "${query}":\n`);

        for (const tool of matches) {
          const auth = tool.requires_auth ? " [auth]" : "";
          console.log(`${tool.name}${auth}`);
          console.log(`  Toolkit: ${tool.toolkit}`);
          if (tool.description) {
            console.log(`  ${tool.description}`);
          }
          console.log();
        }
      } catch (err) {
        logger.error(`Failed to search tools: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  tools
    .command("info <tool>")
    .description("Show detailed information about a tool")
    .action(async (toolName) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        const tool = await client.getTool(toolName);

        console.log(`\n${tool.name}`);
        console.log(`${"=".repeat(tool.name.length)}`);
        console.log(`Toolkit: ${tool.toolkit}`);
        console.log(`Requires Auth: ${tool.requires_auth ? "Yes" : "No"}`);
        if (tool.auth_provider) {
          console.log(`Auth Provider: ${tool.auth_provider}`);
        }
        console.log();
        console.log("Description:");
        console.log(`  ${tool.description}`);

        if (tool.parameters?.properties) {
          console.log();
          console.log("Parameters:");
          for (const [name, param] of Object.entries(tool.parameters.properties)) {
            const required = tool.parameters.required?.includes(name) ? " (required)" : "";
            console.log(`  ${name}: ${param.type}${required}`);
            if (param.description) {
              console.log(`    ${param.description}`);
            }
          }
        }

        console.log();
      } catch (err) {
        logger.error(`Failed to get tool info: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  tools
    .command("execute <tool>")
    .description("Execute an Arcade tool")
    .option("-i, --input <json>", "Tool input as JSON string", "{}")
    .option("--json", "Output as JSON")
    .action(async (toolName, opts) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        let input: Record<string, unknown>;
        try {
          input = JSON.parse(opts.input);
        } catch {
          logger.error("Invalid JSON input");
          return;
        }

        logger.info(`Executing ${toolName}...`);

        const result = await client.executeWithAuth(toolName, input, {
          onAuthRequired: async (authUrl) => {
            console.log(`\nAuthorization required. Please visit:\n${authUrl}\n`);
            console.log("Waiting for authorization...");
            return true; // Wait for auth
          },
        });

        if (opts.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        if (result.success) {
          console.log("\nSuccess!");
          console.log(JSON.stringify(result.output, null, 2));
        } else {
          logger.error(`Execution failed: ${result.error?.message}`);
          if (result.authorization_url) {
            console.log(`\nAuthorization required: ${result.authorization_url}`);
          }
        }
      } catch (err) {
        logger.error(`Failed to execute tool: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  // ==========================================================================
  // Auth Commands
  // ==========================================================================

  const auth = arcade
    .command("auth")
    .description("Manage Arcade authorization");

  auth
    .command("status")
    .description("Check authorization status for tools or toolkits")
    .option("-t, --tool <name>", "Check specific tool")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        if (opts.tool) {
          const response = await client.authorize(opts.tool);

          if (opts.json) {
            console.log(JSON.stringify(response, null, 2));
            return;
          }

          console.log(`\nTool: ${opts.tool}`);
          console.log(`Status: ${response.status}`);
          if (response.authorization_url) {
            console.log(`Auth URL: ${response.authorization_url}`);
          }
          if (response.scopes?.length) {
            console.log(`Scopes: ${response.scopes.join(", ")}`);
          }
        } else {
          // List all connections
          const connections = await client.listUserConnections();

          if (opts.json) {
            console.log(JSON.stringify(connections, null, 2));
            return;
          }

          console.log("\nAuthorized Connections:");
          if (Array.isArray(connections) && connections.length > 0) {
            for (const conn of connections) {
              console.log(`  - ${JSON.stringify(conn)}`);
            }
          } else {
            console.log("  No connections found");
          }
        }

        console.log();
      } catch (err) {
        logger.error(`Failed to check auth status: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  auth
    .command("login <tool>")
    .description("Initiate authorization for a tool")
    .action(async (toolName) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        const response = await client.authorize(toolName);

        if (response.status === "completed") {
          logger.info(`Already authorized for ${toolName}`);
          return;
        }

        if (response.authorization_url) {
          console.log(`\nPlease visit the following URL to authorize ${toolName}:`);
          console.log(`\n  ${response.authorization_url}\n`);

          if (response.authorization_id) {
            logger.info("Waiting for authorization...");

            try {
              await client.waitForAuthorization(response.authorization_id, {
                timeoutMs: 300000, // 5 minutes
                onPoll: (status) => {
                  process.stdout.write(".");
                },
              });

              console.log();
              logger.info(`Successfully authorized ${toolName}`);
            } catch (err) {
              console.log();
              logger.error(
                `Authorization failed or timed out: ${err instanceof Error ? err.message : String(err)}`,
              );
            }
          }
        } else {
          logger.error("No authorization URL returned");
        }
      } catch (err) {
        logger.error(`Failed to initiate auth: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  auth
    .command("revoke <connectionId>")
    .description("Revoke an authorization connection")
    .action(async (connectionId) => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        await client.deleteUserConnection(connectionId);
        logger.info(`Revoked connection: ${connectionId}`);
      } catch (err) {
        logger.error(`Failed to revoke: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

  // ==========================================================================
  // Config Commands
  // ==========================================================================

  arcade
    .command("config")
    .description("Show current Arcade configuration")
    .option("--json", "Output as JSON")
    .action(async (opts) => {
      const safeConfig = {
        ...config,
        apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...` : "(not set)",
      };

      if (opts.json) {
        console.log(JSON.stringify(safeConfig, null, 2));
        return;
      }

      console.log("\nArcade Configuration:");
      console.log(`  Enabled: ${config.enabled}`);
      console.log(`  API Key: ${safeConfig.apiKey}`);
      console.log(`  User ID: ${config.userId || "(not set)"}`);
      console.log(`  Base URL: ${config.baseUrl}`);
      console.log(`  Tool Prefix: ${config.toolPrefix}`);
      console.log(`  Auto Auth: ${config.autoAuth}`);
      console.log(`  Cache TTL: ${config.cacheToolsTtlMs}ms`);

      if (config.tools?.allow?.length || config.tools?.deny?.length) {
        console.log("\n  Tool Filters:");
        if (config.tools.allow?.length) {
          console.log(`    Allow: ${config.tools.allow.join(", ")}`);
        }
        if (config.tools.deny?.length) {
          console.log(`    Deny: ${config.tools.deny.join(", ")}`);
        }
      }

      if (config.toolkits && Object.keys(config.toolkits).length > 0) {
        console.log("\n  Toolkit Config:");
        for (const [id, cfg] of Object.entries(config.toolkits)) {
          console.log(`    ${id}: enabled=${cfg.enabled}`);
          if (cfg.tools?.length) {
            console.log(`      tools: ${cfg.tools.join(", ")}`);
          }
        }
      }

      console.log();
    });

  // ==========================================================================
  // Health Check
  // ==========================================================================

  arcade
    .command("health")
    .description("Check Arcade API health")
    .action(async () => {
      try {
        if (!client.isConfigured()) {
          logger.error("Arcade API key not configured");
          return;
        }

        const health = await client.health();
        logger.info(`Arcade API is healthy: ${JSON.stringify(health)}`);
      } catch (err) {
        logger.error(`Health check failed: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
}
