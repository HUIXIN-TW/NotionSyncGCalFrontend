# NotionSyncGCal Privacy Policy

_Last updated: 2025-08-10_

We access your Google Calendar data **only** to synchronize events you explicitly select between Google Calendar and Notion.

## What We Access

- **Calendar events** (`https://www.googleapis.com/auth/calendar.events`)
  Used to create, update, delete, and move events between calendars you select.
  We do **not** access your full calendar history beyond the events you choose to sync.
- **Calendar list** (`https://www.googleapis.com/auth/calendar.calendarlist.readonly`)
  Used to display the list of your calendars so you can choose which one to sync.

We do **not** request the full calendar management scope (`https://www.googleapis.com/auth/calendar`).

## How It Works

- Authorization happens in the frontend using Google OAuth 2.0.
- Event synchronization is processed by our backend service (AWS Lambda) on-demand or on a schedule you configure.
- Event details are processed **transiently** for synchronization and are **not stored permanently** on our servers.

## Tokens & Security

- We store the minimum required tokens (e.g., refresh token) to run background synchronization.
- Tokens are **encrypted at rest** (AWS-managed encryption) and access is restricted using **least-privilege IAM policies**.

## Data Retention & Deletion

- We keep only identifiers necessary for synchronization (e.g., event IDs, timestamps).
- You can revoke access anytime in your Google Account → Security → Third-party access.
- To request deletion of stored identifiers/tokens, contact us at: **[anguesin@gmail.com](mailto:anguesin@gmail.com)** or **[huixin.yang.tw@gmail.com](mailto:huixin.yang.tw@gmail.com)**.
  We will confirm deletion within 30 days.

## Ads & Sharing

- We do **not** sell your data or use it for advertising.
- Data is **not shared** with third parties except the cloud providers required to operate the service.
