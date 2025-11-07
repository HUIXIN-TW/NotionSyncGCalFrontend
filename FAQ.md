# Notica — Frequently Asked Questions

## How to Connect with the Notion Template

1.  Visit **[https://www.notica.studio/getting-started](https://www.notica.studio/getting-started)**
2.  **Connect Google** → choose your calendar.
3.  **Connect Notion** → authorize your workspace.
4.  When prompted, click **Use the template provided by the developer** to duplicate the database into your workspace.
5.  Copy your **Notion Database ID** and paste it in the setup form.
6.  Enter your **Google Calendar name** and **Calendar ID**, then finish the setup.

## How toFind the Notion Database ID

Open the duplicated database and copy the ID from the URL: `https://www.notion.so//<DATABASE_ID>?v=<VIEW_ID>`

The **DATABASE_ID** is the string of 32 characters (with or without hyphens) between `/` and `?v=`.

## How to Find the Google Calendar ID

Go to **Google Calendar → Settings → Settings for my calendars → [Your calendar] → Integrate calendar**

- Personal calendar: `you@gmail.com`
- Other calendars: something like `xxxxxxxx@group.calendar.google.com`

## Can I Use My Own Database?

Yes! You can use your own Notion database instead of the provided template.

Make sure your database includes these properties (you can rename them as long as the **types** match):

- **Task Name** — _Title_
- **Date** — _Date_
- **Initiative** — _Multi-Select_
- **Status** — _Status_
- **Location** — _Text_
- **Extra Info** — _Text_
- **Calendar** — _Select_
- **GCal Event Id** — _Text_
- **GCal Sync Time** — _Text_
- **GCal End Date** — _Formula_, for example `dateEnd(prop("Date"))`
- **GCal Deleted?** — _Checkbox_
- **GCal Icon** — _Formula_, for example `if(prop("Status") == "✅ Completed", "✅ ", "💡")`

💡 Tip:
If a property is missing, Notica will skip the tasks during synchronization — no data loss will occur. You can use any property names you want — just make sure to map them correctly in your [Notion configuration](https://notica.studio/notion/config).

## Troubleshooting

- **Sync failed** → Double-check that both _Database ID_ and _Calendar ID_ are correct.
- **Permission issue** → Make sure you granted full access (read/write) to both Notion and Google Calendar.
- **No updates appearing** → Verify that you’re editing the correct Notion database and calendar.
- **Multiple workspaces** → Ensure you authorized the correct Notion workspace during connection.
