"use client";

export const FIELD_META = {
  basic: {
    database_id: { label: "Notion Database ID", type: "text", order: 10 },
    goback_days: {
      label: "Go Back Days",
      type: "number",
      showDate: true,
      order: 20,
    },
    goforward_days: {
      label: "Go Forward Days",
      type: "number",
      showDate: true,
      order: 30,
    },
    timecode: {
      label: "Time Offset",
      type: "readonly",
      options: ["+08:00"],
      order: 40,
    },
    timezone: {
      label: "Time Zone",
      type: "select",
      options: [
        "Asia/Taipei",
        "Asia/Hong_Kong",
        "Asia/Shanghai",
        "Asia/Singapore",
        "Asia/Kuala_Lumpur",
        "Australia/Perth",
        "Asia/Manila",
      ],
      order: 50,
    },
    default_event_length: {
      label: "Default Event Length (min)",
      type: "number",
      order: 60,
    },
    default_start_time: {
      label: "Default Start Hour",
      type: "number",
      order: 70,
    },
  },
};

export function prettify(k) {
  return k
    .replace(/_Notion_Name/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (s) => s.toUpperCase());
}

export function calcDateFromToday(days, key) {
  let prefix = "Until";

  if (key === "goforward_days") {
    prefix = "Until";
    days = days - 1; // inclusive for goforward_days due to backend implementation
  } else if (key === "goback_days") {
    prefix = "Since";
    days = -days;
  }

  const now = new Date();
  const target = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const dateStr = target.toISOString().split("T")[0];

  return `(${prefix} ${dateStr})`; // format: (Since 2025-10-24)
}

export function offsetFromTimeZone(timeZone, at = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    const parts = dtf.formatToParts(at);
    const get = (t) =>
      Number((parts.find((p) => p.type === t) || {}).value || 0);
    const asIfUTC = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );
    const offsetMin = Math.round((asIfUTC - at.getTime()) / 60000);
    const sign = offsetMin >= 0 ? "+" : "-";
    const abs = Math.abs(offsetMin);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return `${sign}${hh}:${mm}`;
  } catch {
    return "+00:00";
  }
}

// offsetFromTimeZone("Asia/Taipei");        // +08:00
// offsetFromTimeZone("Australia/Sydney");   // +10:00 或 +11:00（depend on DST）
// offsetFromTimeZone("America/New_York");   // -04:00 或 -05:00
