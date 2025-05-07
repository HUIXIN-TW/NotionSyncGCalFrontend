export default function validateConfig(config) {
  const errors = [];

  // Helper to check time offset like "+08:00"
  const timecodeRegex = /^[-+]\d{2}:\d{2}$/;
  const notionUrlRootPrefix = "https://www.notion.so/";
  // const notionUrlRootSuffix = "&p=";

  // Validate number ranges (and coerce)
  const numFields = [
    { key: "goback_days", min: -100, max: 100 },
    { key: "goforward_days", min: -100, max: 100 },
    { key: "default_event_length", min: 15, max: 1000 },
    { key: "default_start_time", min: 0, max: 23 },
  ];

  numFields.forEach(({ key, min, max }) => {
    const val = Number(config[key]);
    if (isNaN(val)) {
      errors.push(`${key} must be a number`);
    } else {
      config[key] = val;
      if (val < min || val > max) {
        errors.push(`${key} must be between ${min} and ${max}`);
      }
    }
  });

  // Validate notion_token: new secret has no "secret_" prefix
  // if (!config.notion_token?.startsWith("secret_")) {
  //   errors.push("notion_token must start with 'secret_'");
  // }

  // Validate urlroot format
  if (!config.urlroot?.startsWith(notionUrlRootPrefix)) {
    errors.push("urlroot must start with 'https://www.notion.so/'");
  }

  // Validate timecode format
  if (!timecodeRegex.test(config.timecode || "")) {
    errors.push("timecode must be in format ±HH:MM (e.g., +08:00)");
  }

  // Validate timezone
  if (!config.timezone) {
    errors.push("timezone is required");
  }

  // gcal_dic and page_property must be arrays of objects
  if (
    !Array.isArray(config.gcal_dic) ||
    config.gcal_dic.some((item) => typeof item !== "object")
  ) {
    errors.push("Google Calendar Mapping must be an array of key-value objects");
  } else {
    config.gcal_dic.forEach((item, index) => {
      const entries = Object.entries(item);
      if (entries.length !== 1) {
        errors.push(`Google Calendar Mapping: row ${index + 1} must have exactly one key-value pair`);
      } else {
        const [k, v] = entries[0];
        if (!k || !v) {
          errors.push(`Google Calendar Mapping: row ${index + 1} must have non-empty key and value`);
        }
      }
    });
  }

  if (
    !Array.isArray(config.page_property) ||
    config.page_property.some((item) => typeof item !== "object")
  ) {
    errors.push("Page Property Mapping must be an array of key-value objects");
  } else {
    config.page_property.forEach((item, index) => {
      const entries = Object.entries(item);
      if (entries.length !== 12) {
        errors.push(`Page Property Mapping: row ${index + 1} must have exactly one key-value pair`);
      } else {
        const [k, v] = entries[0];
        if (!k || !v) {
          errors.push(`Page Property Mapping: row ${index + 1} must have non-empty key and value`);
        }
      }
    });
  }

  return errors;
}
