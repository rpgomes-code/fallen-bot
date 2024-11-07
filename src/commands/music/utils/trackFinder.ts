import { User } from "discord.js";
import { Player, QueryType, SearchResult, Track } from "discord-player";
import { logError } from "./errorHandler";
import { getDurationFromString } from "./timeUtils";

export interface TrackSearchResult {
  success: boolean;
  track?: Track;
  error?: string;
}

export function isYoutubeMusicURL(url: string): boolean {
  return url.includes("music.youtube.com");
}

export function convertToYouTubeURL(url: string): string {
  return url.replace("music.youtube.com", "youtube.com");
}

export async function findMusicTrack(
  player: Player,
  query: string,
  requestedBy: User
): Promise<TrackSearchResult> {
  try {
    // Handle YouTube Music URLs
    if (isYoutubeMusicURL(query)) {
      query = convertToYouTubeURL(query);
    }

    const searchResult: SearchResult = await player.search(query, {
      requestedBy,
      searchEngine: QueryType.YOUTUBE_SEARCH,
    });

    if (!searchResult || !searchResult.tracks.length) {
      return {
        success: false,
        error: "No results found!",
      };
    }

    const musicTrack = searchResult.tracks.find(validateTrack);

    if (!musicTrack) {
      return {
        success: false,
        error:
          "Could not find a suitable music track. Please try a different search query.",
      };
    }

    return {
      success: true,
      track: musicTrack,
    };
  } catch (error) {
    logError("Track search error", error);
    return {
      success: false,
      error: "An error occurred while searching for the track.",
    };
  }
}

export function validateTrack(track: Track): boolean {
  const title = track.title.toLowerCase();

  // Check for non-music content indicators
  const isNonMusic =
    title.includes("highlights") ||
    title.includes("gameplay") ||
    title.includes("full game") ||
    title.includes("tutorial") ||
    title.includes("walkthrough");

  if (isNonMusic) return false;

  // Convert duration to seconds for length validation
  const durationInSeconds = getDurationFromString(track.duration);

  // Check if it's a reasonable length for a music track (30 seconds to 12 minutes)
  const isReasonableLength =
    durationInSeconds >= 30 && durationInSeconds <= 720;

  return isReasonableLength;
}

export async function searchPlaylist(
  player: Player,
  query: string,
  requestedBy: User
): Promise<SearchResult> {
  try {
    if (isYoutubeMusicURL(query)) {
      query = convertToYouTubeURL(query);
    }

    return await player.search(query, {
      requestedBy,
      searchEngine: QueryType.YOUTUBE_PLAYLIST,
    });
  } catch (error) {
    logError("Playlist search error", error);
    throw error;
  }
}

export function isPlaylistUrl(url: string): boolean {
  return url.includes("list=");
}
