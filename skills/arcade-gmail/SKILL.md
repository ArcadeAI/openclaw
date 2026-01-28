---
name: arcade-gmail
description: Send, search, and manage Gmail via Arcade.dev authorization
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"📧","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# Gmail via Arcade

Use Arcade.dev to send, search, and manage Gmail. Arcade handles OAuth authorization so users don't need to share their credentials.

## Setup

Requires the Arcade plugin with `ARCADE_API_KEY` set.

## Available Tools

### arcade_gmail_send_email
Send an email via Gmail.

Parameters:
- `to` (required): Recipient email address
- `subject` (required): Email subject line
- `body` (required): Email body content
- `cc` (optional): CC recipients
- `bcc` (optional): BCC recipients

Example:
```
Send an email to john@example.com with subject "Meeting Tomorrow" and body "Hi John, let's meet at 2pm."
```

### arcade_gmail_search_messages
Search Gmail inbox.

Parameters:
- `query` (required): Gmail search query

Gmail search operators:
- `is:unread` - Unread messages
- `from:name` - From a sender
- `to:name` - Sent to recipient
- `subject:keyword` - In subject line
- `has:attachment` - Has attachments
- `after:2024/01/01` - After date
- `before:2024/12/31` - Before date
- `label:important` - Has label

Examples:
```
Search Gmail for unread emails from last week
# Uses: is:unread after:YYYY/MM/DD

Search Gmail for emails from boss@company.com with attachments
# Uses: from:boss@company.com has:attachment
```

### arcade_gmail_get_message
Get a specific email by ID.

Parameters:
- `message_id` (required): The Gmail message ID

### arcade_gmail_list_messages
List recent emails.

Parameters:
- `max_results` (optional): Maximum number to return (default: 10)
- `label_ids` (optional): Filter by label

### arcade_gmail_create_draft
Create an email draft.

Parameters:
- `to` (required): Recipient
- `subject` (required): Subject
- `body` (required): Body

### arcade_gmail_list_labels
List all Gmail labels.

## Common Workflows

### Daily Email Summary
```
1. Search Gmail for unread emails from today
2. For each important email, get the full content
3. Summarize the key points
4. Send summary to user
```

### Email Triage
```
1. List unread emails
2. Categorize by sender/subject
3. Flag urgent ones
4. Archive or label others
```

### Send Follow-up
```
1. Search for emails from a contact
2. Read the last conversation
3. Draft a follow-up
4. Send when approved
```

## Authorization

When you first try to use Gmail tools, Arcade will provide an authorization URL. The user must:

1. Visit the URL
2. Sign in to their Google account
3. Grant Gmail access to Arcade
4. Return to continue

Once authorized, the tools work automatically until the user revokes access.

## Notes

- Gmail API has rate limits (~250 quota units/second)
- Search results are limited to ~500 results per query
- Attachments require separate API calls to download
- Draft creation doesn't send the email automatically
