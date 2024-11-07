export interface TimeComponents {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface ParsedTimestamp {
  isValid: boolean;
  seconds?: number;
  error?: string;
}

export function parseTimestamp(timestamp: string): ParsedTimestamp {
  // Handle MM:SS format
  if (timestamp.includes(":")) {
    const parts = timestamp.split(":").map((part) => parseInt(part, 10));

    // Handle both MM:SS and HH:MM:SS formats
    if (parts.length === 2) {
      const [minutes, seconds] = parts;
      if (
        isNaN(minutes) ||
        isNaN(seconds) ||
        seconds >= 60 ||
        minutes < 0 ||
        seconds < 0
      ) {
        return {
          isValid: false,
          error:
            "Invalid timestamp format! Please use MM:SS or number of seconds.",
        };
      }
      return {
        isValid: true,
        seconds: minutes * 60 + seconds,
      };
    } else if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      if (
        isNaN(hours) ||
        isNaN(minutes) ||
        isNaN(seconds) ||
        seconds >= 60 ||
        minutes >= 60 ||
        hours < 0 ||
        minutes < 0 ||
        seconds < 0
      ) {
        return {
          isValid: false,
          error:
            "Invalid timestamp format! Please use HH:MM:SS, MM:SS or number of seconds.",
        };
      }
      return {
        isValid: true,
        seconds: hours * 3600 + minutes * 60 + seconds,
      };
    }
  }

  // Handle direct seconds input
  const seconds = parseInt(timestamp, 10);
  if (isNaN(seconds) || seconds < 0) {
    return {
      isValid: false,
      error: "Invalid timestamp! Please provide a valid number of seconds.",
    };
  }

  return {
    isValid: true,
    seconds,
  };
}

export function formatDuration(durationInSeconds: number): string {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  if (hours > 0) {
    return `${hours}:${padZero(minutes)}:${padZero(seconds)}`;
  }
  return `${minutes}:${padZero(seconds)}`;
}

export function getDurationFromString(duration: string): number {
  const parts = duration.split(":").map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}

export function getTotalDurationString(durationInSeconds: number): string {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  const seconds = durationInSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(" ");
}

function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export function validateDuration(
  timeInSeconds: number,
  totalDuration: number
): boolean {
  return timeInSeconds >= 0 && timeInSeconds < totalDuration;
}
