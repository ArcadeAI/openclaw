---
name: arcade
description: Arcade.dev integration for 100+ authorized tools (Gmail, Slack, GitHub, Calendar, etc.)
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"🕹️","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# Arcade.dev Tools

Arcade.dev provides authorized access to 100+ tools across productivity, communication, development, and business services. Each tool handles OAuth automatically - users authorize once and the agent can act on their behalf.

## Setup

1. Get an API key from [api.arcade.dev](https://api.arcade.dev)
2. Set the environment variable:
```bash
export ARCADE_API_KEY="arc_..."
```
3. Enable the Arcade plugin in Moltbot config:
```json5
{
  plugins: {
    entries: {
      arcade: {
        enabled: true,
        config: {
          userId: "user@example.com"
        }
      }
    }
  }
}
```

## Available Tool Categories

### Productivity
- **Gmail**: Send, search, read emails
- **Google Calendar**: Create, list, update events
- **Google Drive**: Upload, list, share files
- **Google Docs**: Create and edit documents
- **Google Sheets**: Read and write spreadsheet data
- **Notion**: Manage pages and databases
- **Asana**: Task and project management
- **Linear**: Issue tracking
- **Jira**: Issue and project tracking

### Communication
- **Slack**: Send messages, list channels, search
- **Discord**: Send messages, manage servers
- **Microsoft Teams**: Send messages, list channels
- **Outlook**: Email and calendar
- **Zoom**: Create and manage meetings

### Development
- **GitHub**: Manage repos, issues, pull requests
- **Figma**: Access design files and comments

### Business
- **Stripe**: Manage customers and payments
- **HubSpot**: CRM contacts and deals
- **Salesforce**: CRM queries and records
- **Zendesk**: Support tickets

## Using Arcade Tools

### Listing Available Tools

Use `arcade_list_tools` to discover available tools:
```
List all available Arcade tools
```

Filter by toolkit:
```
List Gmail tools from Arcade
```

### Authorization

When a tool requires authorization, Arcade will provide a URL. The user must visit the URL to grant access. Once authorized, the tool works automatically.

Use `arcade_authorize` to pre-authorize a tool:
```
Authorize Gmail access via Arcade
```

### Executing Tools

Tools are available as `arcade_<toolkit>_<action>`:
- `arcade_gmail_send_email`
- `arcade_slack_post_message`
- `arcade_github_list_issues`

Or use the generic `arcade_execute` tool:
```
Execute Gmail.SearchMessages with query "is:unread"
```

## Common Patterns

### Check Then Act

Always check if a tool is authorized before using it:
```
1. Check authorization status for Gmail
2. If not authorized, provide the auth URL
3. Once authorized, proceed with the action
```

### Error Handling

If you get an authorization error:
1. The response will include an `authorization_url`
2. Share this URL with the user
3. Wait for them to complete authorization
4. Retry the action

### Multi-Step Workflows

Chain tools together for complex workflows:
1. Search Gmail for unread emails
2. Summarize the important ones
3. Create a Google Doc with the summary
4. Share the doc via Slack

## Tool Reference

### arcade_list_tools
List available Arcade tools.
- `toolkit` (optional): Filter by toolkit name

### arcade_authorize
Initiate authorization for a tool.
- `tool_name` (required): The Arcade tool name (e.g., Gmail.SendEmail)

### arcade_execute
Execute any Arcade tool.
- `tool_name` (required): The Arcade tool name
- `input` (required): Tool parameters as JSON

### Dynamically Registered Tools

When the Arcade plugin loads, it registers individual tools like:
- `arcade_gmail_send_email`
- `arcade_gmail_search_messages`
- `arcade_slack_post_message`
- `arcade_github_create_issue`
- etc.

Each tool has parameters matching the Arcade API.

## Best Practices

1. **User Consent**: Always confirm before taking actions on behalf of the user
2. **Minimal Scope**: Only authorize tools you actually need
3. **Error Messages**: Provide clear instructions when authorization is required
4. **Rate Limits**: Arcade has rate limits; don't spam API calls
5. **Sensitive Data**: Be careful with email content and private messages
