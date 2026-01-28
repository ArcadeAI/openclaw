---
name: arcade-calendar
description: Manage Google Calendar events via Arcade.dev authorization
homepage: https://docs.arcade.dev
metadata: {"moltbot":{"emoji":"📅","requires":{"env":["ARCADE_API_KEY"]},"primaryEnv":"ARCADE_API_KEY","plugins":["arcade"]}}
---

# Google Calendar via Arcade

Use Arcade.dev to create, read, update, and delete Google Calendar events. Arcade handles OAuth authorization securely.

## Setup

Requires the Arcade plugin with `ARCADE_API_KEY` set.

## Available Tools

### arcade_google_calendar_list_events
List upcoming events from a calendar.

Parameters:
- `calendar_id` (optional): Calendar ID (default: "primary")
- `time_min` (optional): Start time (ISO 8601 format)
- `time_max` (optional): End time (ISO 8601 format)
- `max_results` (optional): Maximum events to return

Example:
```
List my calendar events for this week
```

### arcade_google_calendar_create_event
Create a new calendar event.

Parameters:
- `summary` (required): Event title
- `start` (required): Start time (ISO 8601 or date)
- `end` (required): End time (ISO 8601 or date)
- `description` (optional): Event description
- `location` (optional): Event location
- `attendees` (optional): List of attendee emails
- `calendar_id` (optional): Calendar ID (default: "primary")

Example:
```
Create a meeting "Team Standup" tomorrow at 10am for 30 minutes in the Conference Room
```

### arcade_google_calendar_get_event
Get details of a specific event.

Parameters:
- `event_id` (required): Event ID
- `calendar_id` (optional): Calendar ID

### arcade_google_calendar_update_event
Update an existing event.

Parameters:
- `event_id` (required): Event ID
- `summary` (optional): New title
- `start` (optional): New start time
- `end` (optional): New end time
- `description` (optional): New description
- `location` (optional): New location

### arcade_google_calendar_delete_event
Delete a calendar event.

Parameters:
- `event_id` (required): Event ID
- `calendar_id` (optional): Calendar ID

## Time Formats

Google Calendar uses ISO 8601 format:
- Date only: `2024-12-25`
- DateTime: `2024-12-25T10:00:00-05:00`
- DateTime UTC: `2024-12-25T15:00:00Z`

For all-day events, use date format only (no time).

## Common Workflows

### Check Schedule
```
1. List events for the next 24 hours
2. Identify any conflicts
3. Report available time slots
```

### Schedule Meeting
```
1. Check availability for the proposed time
2. Create the event with attendees
3. Confirm creation with event link
```

### Reschedule Event
```
1. Find the event by title or description
2. Update the start/end times
3. Optionally update location
4. Notify attendees
```

### Daily Briefing
```
1. List today's events
2. Get details for important meetings
3. Summarize schedule
```

## Authorization

First use provides an OAuth URL. The user must:

1. Visit the URL
2. Sign in to their Google account
3. Grant calendar access to Arcade
4. Return to continue

## Notes

- Default calendar is "primary" (user's main calendar)
- Recurring events may need special handling
- Event IDs are opaque strings
- All-day events use date format (not datetime)
- Timezones should match the calendar's timezone
