---
name: arcade-github
description: Manage GitHub repositories, issues, and PRs via Arcade.dev authorization
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"🐙","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# GitHub via Arcade

Use Arcade.dev to manage GitHub repositories, issues, pull requests, and more. Arcade handles OAuth so users get secure repo access.

## Setup

Requires the Arcade plugin with `ARCADE_API_KEY` set.

## Available Tools

### arcade_github_list_repos
List repositories for the authenticated user.

Parameters:
- `type` (optional): `all`, `owner`, `public`, `private`, `member`
- `sort` (optional): `created`, `updated`, `pushed`, `full_name`
- `per_page` (optional): Results per page (max 100)

### arcade_github_get_repo
Get repository details.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name

### arcade_github_list_issues
List issues in a repository.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `state` (optional): `open`, `closed`, `all`
- `labels` (optional): Comma-separated label names
- `assignee` (optional): Username or `*` for any

### arcade_github_create_issue
Create a new issue.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `title` (required): Issue title
- `body` (optional): Issue description (Markdown)
- `labels` (optional): Array of label names
- `assignees` (optional): Array of usernames

Example:
```
Create an issue in owner/repo titled "Bug: Login fails on mobile" with body describing the steps to reproduce
```

### arcade_github_get_issue
Get issue details.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `issue_number` (required): Issue number

### arcade_github_update_issue
Update an existing issue.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `issue_number` (required): Issue number
- `title` (optional): New title
- `body` (optional): New body
- `state` (optional): `open` or `closed`
- `labels` (optional): Replace labels

### arcade_github_list_pull_requests
List pull requests.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `state` (optional): `open`, `closed`, `all`
- `sort` (optional): `created`, `updated`, `popularity`

### arcade_github_get_pull_request
Get PR details.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `pull_number` (required): PR number

### arcade_github_create_pull_request
Create a pull request.

Parameters:
- `owner` (required): Repository owner
- `repo` (required): Repository name
- `title` (required): PR title
- `head` (required): Source branch
- `base` (required): Target branch
- `body` (optional): PR description

## Common Workflows

### Issue Triage
```
1. List open issues without labels
2. Categorize by title/description
3. Add appropriate labels
4. Assign to team members
```

### PR Review Summary
```
1. List open PRs
2. Get details for each PR
3. Summarize changes and status
4. Report on review progress
```

### Release Notes
```
1. List closed issues since last release
2. Group by label (bug, feature, etc.)
3. Generate formatted changelog
4. Create a release issue/doc
```

### Bug Report
```
1. Check for duplicate issues
2. Create issue with proper template
3. Add relevant labels
4. Mention appropriate team
```

## Markdown Tips

GitHub issues and PRs support Markdown:

```markdown
## Headers

**Bold** and _italic_ and `code`

- Bullet lists
1. Numbered lists

[Link](https://example.com)

![Image](url)

| Table | Header |
|-------|--------|
| cell  | cell   |

- [ ] Task list
- [x] Completed task

@username mentions
#123 issue references
```

## Authorization

First use provides an OAuth URL. The user must:

1. Visit the URL
2. Sign in to GitHub
3. Authorize Arcade app for repo access
4. Return to continue

Scopes requested depend on the tools used:
- `repo` - Full repository access
- `public_repo` - Public repos only
- `read:org` - Organization membership

## Notes

- API rate limit: 5000 requests/hour (authenticated)
- Large repos may need pagination
- Private repos require explicit authorization
- Organization repos need org-level app installation
