import "server-only";

function parseDatetimeFormat(msTimestamp) {
  const date = new Date(msTimestamp);
  const iso = date.toISOString(); // e.g., "2025-05-02T20:06:57.562Z"

  // Remove 'Z', split into date and time, and pad milliseconds to microseconds
  const [datePart, timePart] = iso.slice(0, -1).split("T"); // remove 'Z'
  const [time, milli] = timePart.split(".");
  const paddedMicroseconds = milli.padEnd(6, "0"); // e.g., "562000"

  return `${datePart}T${time}.${paddedMicroseconds}`;
}

export default parseDatetimeFormat;
