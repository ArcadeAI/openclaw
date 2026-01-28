---
name: arcade-slack
description: Send messages and manage Slack via Arcade.dev authorization
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"💬","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# Slack via Arcade

Use Arcade.dev to send messages, search, and manage Slack workspaces. Arcade handles OAuth authorization securely.

## Setup

Requires the Arcade plugin with `ARCADE_API_KEY` set.

## Available Tools

### arcade_slack_post_message
Send a message to a Slack channel or user.

Parameters:
- `channel` (required): Channel ID or name (e.g., `#general`, `C1234567890`)
- `text` (required): Message text
- `thread_ts` (optional): Thread timestamp for replies
- `mrkdwn` (optional): Enable markdown formatting

Example:
```
Post "Project update: All tests passing!" to #engineering
```

### arcade_slack_list_channels
List channels in the workspace.

Parameters:
- `types` (optional): Channel types (`public_channel`, `private_channel`, `mpim`, `im`)
- `limit` (optional): Maximum results

### arcade_slack_get_channel_history
Get recent messages from a channel.

Parameters:
- `channel` (required): Channel ID
- `limit` (optional): Number of messages (default: 100)
- `oldest` (optional): Oldest timestamp to fetch from

### arcade_slack_search_messages
Search for messages across the workspace.

Parameters:
- `query` (required): Search query

Search operators:
- `from:@username` - From a user
- `in:#channel` - In a channel
- `has:link` - Contains links
- `has:reaction` - Has reactions
- `before:YYYY-MM-DD` - Before date
- `after:YYYY-MM-DD` - After date

### arcade_slack_list_users
List users in the workspace.

Parameters:
- `limit` (optional): Maximum results

## Common Workflows

### Channel Summary
```
1. List channels to find the target
2. Get channel history for last 24 hours
3. Summarize key discussions
4. Post summary to a different channel
```

### Cross-Post Announcement
```
1. List public channels
2. Filter to announcement-type channels
3. Post message to each channel
```

### Find and Respond
```
1. Search for messages mentioning a topic
2. Get the thread context
3. Post a reply in the thread
```

## Message Formatting

Slack supports mrkdwn formatting:

```
*bold* _italic_ ~strikethrough~ `code`

```code block```

- Bullet list
1. Numbered list

<https://example.com|Link text>
<@U1234567890> mention user
<#C1234567890> mention channel
```

## Authorization

First use will provide an OAuth URL. The user must:

1. Visit the URL
2. Sign in to their Slack workspace
3. Authorize the Arcade app
4. Return to continue

## Notes

- Posting requires the bot to be in the channel
- Private channels need explicit invitation
- DMs use user ID as channel (e.g., `U1234567890`)
- Message search requires enterprise or paid plans for full history
- Rate limits: ~1 request/second for posting
