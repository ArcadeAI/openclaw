---
name: arcade-drive
description: Manage Google Drive files and folders via Arcade.dev authorization
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"📁","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# Google Drive via Arcade

Use Arcade.dev to list, search, create, and manage files in Google Drive. Arcade handles OAuth authorization securely.

## Setup

Requires the Arcade plugin with `ARCADE_API_KEY` set.

## Available Tools

### arcade_google_drive_list_files
List files in Google Drive.

Parameters:
- `folder_id` (optional): Folder to list (default: root)
- `page_size` (optional): Number of files to return
- `query` (optional): Search query string

### arcade_google_drive_search_files
Search for files in Google Drive.

Parameters:
- `query` (required): Search query

Search query examples:
- `name contains 'report'` - Files with "report" in name
- `mimeType = 'application/pdf'` - PDF files only
- `modifiedTime > '2024-01-01'` - Modified after date
- `'folder_id' in parents` - Files in specific folder
- `trashed = false` - Not in trash

### arcade_google_drive_get_file
Get file metadata.

Parameters:
- `file_id` (required): File ID

### arcade_google_drive_create_file
Create a new file.

Parameters:
- `name` (required): File name
- `content` (optional): File content
- `mime_type` (optional): MIME type
- `parent_id` (optional): Parent folder ID

### arcade_google_drive_update_file
Update file content or metadata.

Parameters:
- `file_id` (required): File ID
- `name` (optional): New name
- `content` (optional): New content

### arcade_google_drive_delete_file
Delete a file.

Parameters:
- `file_id` (required): File ID

### arcade_google_drive_share_file
Share a file with others.

Parameters:
- `file_id` (required): File ID
- `email` (required): Email to share with
- `role` (required): Permission role (`reader`, `writer`, `commenter`)

## MIME Types

Common MIME types:
- `application/vnd.google-apps.document` - Google Doc
- `application/vnd.google-apps.spreadsheet` - Google Sheet
- `application/vnd.google-apps.presentation` - Google Slides
- `application/vnd.google-apps.folder` - Folder
- `application/pdf` - PDF
- `text/plain` - Plain text
- `image/jpeg` - JPEG image
- `image/png` - PNG image

## Common Workflows

### Find Document
```
1. Search for files matching a pattern
2. Get metadata for matches
3. Return file names and IDs
```

### Create Shared Document
```
1. Create a new document
2. Add content
3. Share with specific users
4. Return sharing link
```

### Organize Files
```
1. List files in a folder
2. Create new subfolder
3. Move files into subfolder
```

### Backup Search Results
```
1. Search for recent files
2. Create a summary document
3. Add links to found files
```

## Authorization

First use provides an OAuth URL. The user must:

1. Visit the URL
2. Sign in to their Google account
3. Grant Drive access to Arcade
4. Return to continue

## Notes

- File IDs are opaque strings (not paths)
- Use search queries to find files by name/type
- Google Docs/Sheets have special MIME types
- Folder creation uses `application/vnd.google-apps.folder` MIME type
- Sharing may require domain-level permissions
- Large file uploads may need chunked upload
