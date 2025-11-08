# Frequently Asked Questions

## How to Connect with the Notion Template

### Step 1 Start from the Getting Started Page

- Visit **[https://www.notica.studio/getting-started](https://www.notica.studio/getting-started)**.
- **Connect Google** → choose your calendar.
- **Connect Notion** → authorize your workspace.
  - When prompted, click **Use the template provided by the developer** to copy the database into your workspace.

### Step 2 Verify Notica Permissions

- In your duplicated page, click the **⋯** → **Connections**.
- Make sure **Notica** is listed under Connections.
- If it isn’t, follow the [Manual Duplicate the Notion Template](#manual-duplicate-the-notion-template) section below.

### Step 3 Complete Setup in Notica

- Copy your **Notion Database ID** from the duplicated database URL.  
  Example: `https://www.notion.so/yourworkspace/<DATABASE_ID>?v=<VIEW_ID>`
- Paste it into the setup form in Notica.
- Enter your **Google Calendar name** and **Calendar ID**.
- Finish setup! Your sync is now ready.

## Manual Duplicate the Notion Template

If the Notion authorization succeeds but the database isn’t duplicated automatically, follow these steps:

### Step 1 Duplicate the Template

1. Open the official Notica template: [Notica Template](https://www.notion.so/Notica-Page-Template-2a4438de0d8880b3a8a3de97b5e2c122)
2. Click **Duplicate** (top-right corner).
3. The template will appear in your workspace under **Private** or your chosen team space.

### Step 2 Connect Notica Integration

1. In your duplicated Notion page, click the **⋯ (three dots)** → **Connections** → **Connect**.
2. Choose or type **`Notica`** as the integration.

Back to [How to Connect with the Notion Template](#how-to-connect-with-the-notion-template).

## How to Find the Notion Database ID

Open the duplicated database and copy the ID from the URL:  
`https://www.notion.so/<DATABASE_ID>?v=<VIEW_ID>`

The **DATABASE_ID** is the 32-character string (with or without hyphens) between `/` and `?v=`.

## How to Find the Google Calendar ID

Go to **Google Calendar → Settings → Settings for my calendars → [Your calendar] → Integrate calendar**

- **Personal calendar:** `you@gmail.com`
- **Shared calendar:** something like `xxxxxxxx@group.calendar.google.com`

## Can I Use My Own Database?

Yes. You can use your own Notion database instead of the provided template.  
Make sure it includes these properties (names can vary as long as **types** match):

| Property Name  | Type         | Example / Formula                                   |
| -------------- | ------------ | --------------------------------------------------- |
| Task Name      | Title        | —                                                   |
| Date           | Date         | —                                                   |
| Initiative     | Multi-Select | —                                                   |
| Status         | Status       | —                                                   |
| Location       | Text         | —                                                   |
| Extra Info     | Text         | —                                                   |
| Calendar       | Select       | —                                                   |
| GCal Event Id  | Text         | —                                                   |
| GCal Sync Time | Text         | —                                                   |
| GCal End Date  | Formula      | `dateEnd(prop("Date"))`                             |
| GCal Deleted?  | Checkbox     | —                                                   |
| GCal Icon      | Formula      | `if(prop("Status") == "✅ Completed", "✅ ", "💡")` |

💡 **Tip:**  
If a property is missing, Notica will simply skip those items during synchronization, no data loss occurs.  
You can rename columns freely as long as you map them correctly in your [Notion configuration](https://notica.studio/notion/config).

## Limitations

- Each sync supports **up to 100 tasks** in your Notion database.  
  If you have more, limit the date range or filter your view to reduce items.
- Google Calendar limits event descriptions to **4000 characters**.  
  Longer text may be truncated.

## Troubleshooting

- **Sync failed:** Double-check your Database ID and Calendar ID.
- **Permission issue:** Ensure both Notion and Google Calendar integrations have full access.
- **No updates appearing:** Confirm you’re editing the correct Notion database and calendar.
- **Multiple workspaces:** Verify you authorized the correct Notion workspace during setup.
