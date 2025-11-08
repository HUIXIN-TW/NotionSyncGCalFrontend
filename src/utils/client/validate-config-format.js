"use client";

export default function validateConfigFormat(cfg) {
  const errors = [];

  // ---- numbers ----
  const numFields = [
    { key: "goback_days", min: -100, max: 100 },
    { key: "goforward_days", min: -100, max: 100 },
    { key: "default_event_length", min: 15, max: 1000 },
    { key: "default_start_time", min: 0, max: 23 },
  ];
  for (const { key, min, max } of numFields) {
    const v = Number(cfg[key]);
    if (Number.isNaN(v)) {
      errors.push(`${key} must be a number`);
    } else if (v < min || v > max) {
      errors.push(`${key} must be between ${min} and ${max}`);
    }
  }

  // ---- timecode ----
  const timecodeRegex = /^[-+]\d{2}:\d{2}$/;
  if (!timecodeRegex.test(cfg.timecode || "")) {
    errors.push("timecode must be in format ±HH:MM (e.g., +08:00)");
  }

  // ---- timezone ----
  if (!cfg.timezone) {
    errors.push("timezone is required");
  }

  // ---- gcal_dic ----
  if (
    !Array.isArray(cfg.gcal_dic) ||
    cfg.gcal_dic.some((it) => typeof it !== "object" || it === null)
  ) {
    errors.push(
      "Google Calendar Mapping must be an array of key-value objects",
    );
  } else if (
    cfg.gcal_dic.length === 0 ||
    Object.keys(cfg.gcal_dic[0] || {}).length === 0
  ) {
    errors.push(
      "Google Calendar Mapping must have at least one key-value pair",
    );
  }

  // ---- page_property ----
  if (
    !Array.isArray(cfg.page_property) ||
    cfg.page_property.some((it) => typeof it !== "object" || it === null)
  ) {
    errors.push("Page Property Mapping must be an array of key-value objects");
  } else {
    const obj = cfg.page_property[0] || {};
    const expectedKeys = [
      "Task_Notion_Name",
      "Date_Notion_Name",
      "Initiative_Notion_Name",
      "Status_Notion_Name",
      "Location_Notion_Name",
      "ExtraInfo_Notion_Name",
      "GCal_Name_Notion_Name",
      "GCal_EventId_Notion_Name",
      "GCal_Sync_Time_Notion_Name",
      "GCal_End_Date_Notion_Name",
      "Delete_Notion_Name",
      "CompleteIcon_Notion_Name",
    ];
    for (const k of expectedKeys) {
      if (!(k in obj) || !obj[k]) {
        errors.push(`Page Property Mapping missing value for "${k}"`);
      }
    }
  }

  return errors;
}
