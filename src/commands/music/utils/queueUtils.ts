import { GuildQueue, Track } from "discord-player";
import { getDurationFromString, getTotalDurationString } from "./timeUtils";

export interface QueueStats {
  totalTracks: number;
  totalDuration: number;
  currentPage: number;
  totalPages: number;
  tracksPerPage: number;
}

export interface QueueDisplayInfo {
  currentTrack: string;
  trackList: string[];
  stats: QueueStats;
}

export function getQueueStats(
  queue: GuildQueue,
  page: number = 1,
  tracksPerPage: number = 10
): QueueStats {
  const tracks = queue.tracks.toArray();
  const totalDuration = calculateTotalDuration(tracks);
  const totalPages = Math.ceil(tracks.length / tracksPerPage);

  return {
    totalTracks: tracks.length,
    totalDuration,
    currentPage: page,
    totalPages,
    tracksPerPage,
  };
}

export function getQueueDisplayInfo(
  queue: GuildQueue,
  page: number = 1,
  tracksPerPage: number = 10
): QueueDisplayInfo {
  const currentTrack = formatCurrentTrack(queue.currentTrack);
  const { trackList, stats } = formatQueueTracks(queue, page, tracksPerPage);

  return {
    currentTrack,
    trackList,
    stats,
  };
}

export function getLoopModeName(mode: number): string {
  switch (mode) {
    case 0:
      return "Off";
    case 1:
      return "Track";
    case 2:
      return "Queue";
    default:
      return "Unknown";
  }
}

function calculateTotalDuration(tracks: Track[]): number {
  return tracks.reduce((total, track) => {
    return total + getDurationFromString(track.duration);
  }, 0);
}

function formatCurrentTrack(track: Track | null): string {
  if (!track) return "None";
  return `[${track.title}](${track.url}) - ${track.duration}`;
}

function formatQueueTracks(
  queue: GuildQueue,
  page: number,
  tracksPerPage: number
): { trackList: string[]; stats: QueueStats } {
  const tracks = queue.tracks.toArray();
  const stats = getQueueStats(queue, page, tracksPerPage);

  const startIndex = (page - 1) * tracksPerPage;
  const endIndex = startIndex + tracksPerPage;
  const displayedTracks = tracks.slice(startIndex, endIndex);

  const trackList = displayedTracks.map((track, index) => {
    return `${startIndex + index + 1}. [${track.title}](${track.url}) - ${
      track.duration
    } - Requested by ${track.requestedBy?.tag || "Unknown"}`;
  });

  return { trackList, stats };
}

export function validateQueuePage(
  page: number,
  queue: GuildQueue
): {
  isValid: boolean;
  error?: string;
} {
  const totalPages = Math.ceil(queue.tracks.size / 10);

  if (page < 1 || page > totalPages) {
    return {
      isValid: false,
      error: `Invalid page number. The queue has ${totalPages} page${
        totalPages === 1 ? "" : "s"
      }.`,
    };
  }

  return { isValid: true };
}

export function getQueueProgressBar(
  queue: GuildQueue,
  length: number = 20
): string {
  if (!queue.node.isPlaying() || !queue.currentTrack) {
    return "[" + "=".repeat(length) + "]";
  }

  const timestamp = queue.node.getTimestamp();
  if (!timestamp) return "[" + "=".repeat(length) + "]";

  const totalTime = getDurationFromString(queue.currentTrack.duration);
  const currentTime = timestamp.current.value; // Using .value instead of .totalSeconds
  const progress = Math.floor((currentTime / totalTime) * length);

  return (
    "[" + "=".repeat(progress) + ">" + " ".repeat(length - progress - 1) + "]"
  );
}

// Helper function to get formatted queue duration
export function getQueueDuration(queue: GuildQueue): string {
  const tracks = queue.tracks.toArray();
  if (!tracks.length) return "0:00";

  const totalSeconds = calculateTotalDuration(tracks);
  return getTotalDurationString(totalSeconds);
}

// Helper function to check if queue has next track
export function hasNextTrack(queue: GuildQueue): boolean {
  return queue.tracks.size > 0;
}

// Helper function to get queue size
export function getQueueSize(queue: GuildQueue): number {
  return queue.tracks.size;
}

// Helper function to check if track is within bounds
export function isTrackIndexValid(queue: GuildQueue, index: number): boolean {
  return index >= 0 && index < queue.tracks.size;
}

// Helper function to get next tracks preview
export function getNextTracksPreview(
  queue: GuildQueue,
  count: number = 3
): string[] {
  return queue.tracks
    .toArray()
    .slice(0, count)
    .map((track) => `${track.title} - ${track.duration}`);
}
