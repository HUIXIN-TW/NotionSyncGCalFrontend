export default function validateConfig(config) {
  const errors = [];

  // Helper to check time offset like "+08:00"
  const timecodeRegex = /^[-+]\d{2}:\d{2}$/;
  const notionUrlRootPrefix = "https://www.notion.so/";
  const notionUrlRootSuffix = "&p=";

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
      config[key] = val; // mutate with casted number
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
    errors.push("gcal_dic must be an array of key-value objects");
  }

  if (
    !Array.isArray(config.page_property) ||
    config.page_property.some((item) => typeof item !== "object")
  ) {
    errors.push("page_property must be an array of key-value objects");
  }

  return errors;
}
