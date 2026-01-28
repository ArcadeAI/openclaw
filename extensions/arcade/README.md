# Moltbot Arcade.dev Plugin

Connect Moltbot to [Arcade.dev](https://arcade.dev) for access to 100+ authorized tools across productivity, communication, development, and business services.

## Features

- **100+ Tools**: Gmail, Google Calendar, Slack, Discord, GitHub, Notion, Linear, Jira, Stripe, HubSpot, and more
- **Automatic OAuth**: Arcade handles all authorization flows securely
- **Dynamic Registration**: Tools are automatically discovered and registered
- **JIT Authorization**: Prompts users to authorize when needed
- **Tool Filtering**: Control which tools are available via allowlists/denylists
- **CLI Commands**: Manage tools and authorization from the command line
- **Gateway RPC**: Direct tool invocation via Gateway methods

## Installation

### Via npm

```bash
moltbot plugins install @moltbot/arcade
```

### Via local development

```bash
# Clone the repo
git clone https://github.com/moltbot/moltbot.git
cd moltbot

# Enable the plugin
moltbot plugins enable arcade
```

## Configuration

### Environment Variables

```bash
export ARCADE_API_KEY="arc_..."          # Required: Arcade API key
export ARCADE_USER_ID="user@example.com" # Optional: Default user ID
```

### Config File

```json5
// ~/.clawdbot/moltbot.json
{
  plugins: {
    entries: {
      arcade: {
        enabled: true,
        config: {
          apiKey: "${ARCADE_API_KEY}",
          userId: "user@example.com",

          // Filter available tools
          tools: {
            allow: ["Gmail.*", "Slack.*", "GitHub.*"],
            deny: ["*.Delete*"]
          },

          // Per-toolkit configuration
          toolkits: {
            gmail: { enabled: true },
            slack: { enabled: true, tools: ["Slack.PostMessage"] }
          }
        }
      }
    }
  }
}
```

## Usage

### Agent Tools

When the plugin loads, it registers tools like:

- `arcade_gmail_send_email`
- `arcade_gmail_search_messages`
- `arcade_slack_post_message`
- `arcade_github_create_issue`

Plus utility tools:

- `arcade_list_tools` - List available tools
- `arcade_authorize` - Pre-authorize a tool
- `arcade_execute` - Execute any tool by name

### CLI Commands

```bash
# List available tools
moltbot arcade tools list
moltbot arcade tools list --toolkit gmail

# Search for tools
moltbot arcade tools search email

# Get tool info
moltbot arcade tools info Gmail.SendEmail

# Execute a tool
moltbot arcade tools execute Gmail.SendEmail --input '{"to":"test@example.com","subject":"Hello","body":"Test"}'

# Check authorization status
moltbot arcade auth status
moltbot arcade auth status --tool Gmail.SendEmail

# Authorize a tool
moltbot arcade auth login Gmail.SendEmail

# Show configuration
moltbot arcade config

# Health check
moltbot arcade health
```

### Gateway RPC

```javascript
// List tools
await gateway.call("arcade.tools.list", { toolkit: "gmail" });

// Execute tool
await gateway.call("arcade.tools.execute", {
  tool: "Gmail.SendEmail",
  input: { to: "test@example.com", subject: "Hello", body: "Test" }
});

// Check auth status
await gateway.call("arcade.auth.status", { tool: "Gmail.SendEmail" });

// Authorize
await gateway.call("arcade.auth.authorize", { tool: "Gmail.SendEmail" });

// Plugin status
await gateway.call("arcade.status", {});
```

### Chat Commands

```
/arcade           # Show status
/arcade status    # Show status
/arcade tools     # List tools
/arcade tools gmail  # List Gmail tools
```

## Available Toolkits

### Productivity
- Gmail
- Google Calendar
- Google Drive
- Google Docs
- Google Sheets
- Notion
- Asana
- Linear
- Jira

### Communication
- Slack
- Discord
- Microsoft Teams
- Outlook
- Zoom

### Development
- GitHub
- Figma

### Business
- Stripe
- HubSpot
- Salesforce
- Zendesk
- Intercom

### Search & Data
- Google Search
- Google News
- Firecrawl

### Databases
- PostgreSQL
- MongoDB

## Authorization Flow

1. User invokes a tool (e.g., "Send an email via Gmail")
2. If not authorized, Arcade returns an authorization URL
3. Moltbot prompts the user with the URL
4. User visits URL and grants access
5. Tool execution proceeds automatically

## Skills

The plugin includes several skills to help the agent use Arcade tools effectively:

- `arcade` - General Arcade usage
- `arcade-gmail` - Gmail-specific workflows
- `arcade-slack` - Slack messaging patterns
- `arcade-github` - GitHub repository management

## Development

```bash
# Run tests
cd extensions/arcade
pnpm test

# Type check
pnpm build

# Lint
pnpm lint
```

## API Reference

### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable the plugin |
| `apiKey` | string | - | Arcade API key |
| `userId` | string | - | Default user ID for authorization |
| `baseUrl` | string | `https://api.arcade.dev` | API base URL |
| `toolPrefix` | string | `arcade` | Prefix for tool names |
| `autoAuth` | boolean | `true` | Auto-prompt for authorization |
| `cacheToolsTtlMs` | number | `300000` | Tool cache TTL (5 min) |
| `tools.allow` | string[] | - | Allowlist patterns |
| `tools.deny` | string[] | - | Denylist patterns |
| `toolkits.<id>.enabled` | boolean | `true` | Enable/disable toolkit |
| `toolkits.<id>.tools` | string[] | - | Specific tools to enable |

### Environment Variables

| Variable | Description |
|----------|-------------|
| `ARCADE_API_KEY` | Arcade API key |
| `ARCADE_KEY` | Alternative API key variable |
| `ARCADE_USER_ID` | Default user ID |
| `ARCADE_USER` | Alternative user ID variable |

## License

MIT
