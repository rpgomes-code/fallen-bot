/**
 * Parse a time string into milliseconds
 * Supported formats:
 * - 30s, 30sec, 30seconds
 * - 5m, 5min, 5minutes
 * - 1h, 1hr, 1hour, 1hours
 * - 1d, 1day, 1days
 * - 1w, 1week, 1weeks
 *
 * @param timeString The time string to parse
 * @returns The time in milliseconds, or null if the format is invalid
 */
export function parseTimeString(timeString: string): number | null {
  // Remove whitespace and convert to lowercase
  const str = timeString.trim().toLowerCase();

  // Match the pattern of a number followed by a unit
  const match = str.match(/^(\d+)([a-z]+)$/);
  if (!match) return null;

  const value = parseInt(match[1], 10);
  const unit = match[2];

  // Convert to milliseconds based on unit
  const seconds = 1000;
  const minutes = seconds * 60;
  const hours = minutes * 60;
  const days = hours * 24;
  const weeks = days * 7;

  switch (unit) {
    // Seconds
    case "s":
    case "sec":
    case "secs":
    case "second":
    case "seconds":
      return value * seconds;

    // Minutes
    case "m":
    case "min":
    case "mins":
    case "minute":
    case "minutes":
      return value * minutes;

    // Hours
    case "h":
    case "hr":
    case "hrs":
    case "hour":
    case "hours":
      return value * hours;

    // Days
    case "d":
    case "day":
    case "days":
      return value * days;

    // Weeks
    case "w":
    case "week":
    case "weeks":
      return value * weeks;

    // Unrecognized unit
    default:
      return null;
  }
}
