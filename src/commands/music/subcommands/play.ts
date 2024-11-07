import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { GuildQueue, Track, QueryType } from "discord-player";
import { handleCommandError } from "../utils/errorHandler";
import { BotClient } from "../../../types";
import {
  findMusicTrack,
  isPlaylistUrl,
  searchPlaylist,
} from "../utils/trackFinder";
import { getQueueDuration } from "../utils/queueUtils";
import { getDurationFromString } from "../utils/timeUtils";

export async function handlePlay(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const client = interaction.client as BotClient;
    const member = interaction.member as GuildMember;

    // Get or create queue
    let queue = client.player.nodes.get(interaction.guildId!);

    // Create queue if it doesn't exist
    if (!queue) {
      queue = client.player.nodes.create(interaction.guildId!, {
        metadata: {
          channel: interaction.channel,
          client: interaction.client,
          requestedBy: interaction.user,
        },
        selfDeaf: true,
        leaveOnEmpty: true, // The bot will automatically leave if there's no one in the voice channel
        leaveOnEnd: false, // The bot won't leave when queue ends
        leaveOnStop: false, // The bot won't leave when stopped
        volume: 80,
        bufferingTimeout: 3000,
      });
    }

    try {
      // Connect to voice channel if not already connected
      if (!queue.connection) {
        await queue.connect(member.voice.channel!);
      }
    } catch (error) {
      queue.delete();
      return interaction.editReply({
        content: "❌ | Could not join your voice channel!",
      });
    }

    // Get the query
    const query = interaction.options.getString("query", true);

    try {
      // Handle different types of queries
      if (isPlaylistUrl(query)) {
        return handlePlaylist(interaction, queue, query);
      } else {
        return handleSingleTrack(interaction, queue, query);
      }
    } catch (error) {
      console.error("Error handling play request:", error);
      return interaction.editReply({
        content:
          "❌ | An error occurred while processing your request. Please try again.",
      });
    }
  } catch (error) {
    return handleCommandError(interaction, "play", error);
  }
}

async function handlePlaylist(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue,
  query: string
) {
  try {
    const searchResult = await searchPlaylist(
      queue.player,
      query,
      interaction.user
    );

    if (!searchResult?.tracks.length) {
      return interaction.editReply({
        content: "❌ | No tracks found in this playlist!",
      });
    }

    // Add tracks to queue
    queue.addTrack(searchResult.tracks);

    const embed = createPlaylistEmbed(searchResult.tracks, interaction);

    // Start playing if not already playing
    if (!queue.isPlaying()) {
      await queue.node.play();
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error handling playlist:", error);
    return interaction.editReply({
      content: "❌ | Error loading playlist. Please try again.",
    });
  }
}

async function handleSingleTrack(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue,
  query: string
) {
  try {
    // Search for the track
    const searchResult = await findMusicTrack(
      queue.player,
      query,
      interaction.user
    );

    if (!searchResult.success || !searchResult.track) {
      return interaction.editReply({
        content: `❌ | ${searchResult.error || "No results found!"}`,
      });
    }

    // Add track to queue
    queue.addTrack(searchResult.track);

    const embed = createTrackEmbed(searchResult.track, queue);

    // Start playing if not already playing
    if (!queue.isPlaying()) {
      await queue.node.play();
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error handling single track:", error);
    return interaction.editReply({
      content: "❌ | Error adding track. Please try again.",
    });
  }
}

function createPlaylistEmbed(
  tracks: Track[],
  interaction: ChatInputCommandInteraction
): EmbedBuilder {
  const totalDuration = tracks.reduce((acc, track) => {
    return acc + getDurationFromString(track.duration);
  }, 0);

  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("📑 Playlist Added to Queue")
    .setDescription(
      `Added ${tracks.length} track${
        tracks.length === 1 ? "" : "s"
      } to the queue`
    )
    .addFields([
      {
        name: "Total Duration",
        value: getQueueDuration({
          tracks: { size: tracks.length },
        } as GuildQueue),
        inline: true,
      },
      {
        name: "Requested By",
        value: interaction.user.tag,
        inline: true,
      },
    ])
    .setTimestamp();

  // Preview first few tracks
  const previewTracks = tracks
    .slice(0, 3)
    .map(
      (track, index) =>
        `${index + 1}. [${track.title}](${track.url}) (${track.duration})`
    );

  if (previewTracks.length > 0) {
    embed.addFields([
      {
        name: "Preview",
        value: previewTracks.join("\n"),
        inline: false,
      },
    ]);
  }

  if (tracks.length > 3) {
    embed.setFooter({ text: `And ${tracks.length - 3} more tracks...` });
  }

  return embed;
}

function createTrackEmbed(track: Track, queue: GuildQueue): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(queue.isPlaying() ? "🎵 Added to Queue" : "▶️ Now Playing")
    .setDescription(`[${track.title}](${track.url})`)
    .addFields([
      {
        name: "Duration",
        value: track.duration,
        inline: true,
      },
      {
        name: "Artist",
        value: track.author,
        inline: true,
      },
      {
        name: "Requested By",
        value: track.requestedBy?.tag || "Unknown",
        inline: true,
      },
    ])
    .setThumbnail(track.thumbnail || null)
    .setTimestamp();

  // Add queue position if the track was added to queue
  if (queue.isPlaying()) {
    embed.addFields([
      {
        name: "Position in Queue",
        value: `${queue.tracks.size}`,
        inline: true,
      },
    ]);
  }

  // Add estimated time until play if in queue
  if (queue.isPlaying() && queue.tracks.size > 1) {
    const tracksBeforeCurrent = queue.tracks
      .toArray()
      .slice(0, queue.tracks.size - 1);
    const timeUntilPlay = tracksBeforeCurrent.reduce((acc, track) => {
      return acc + getDurationFromString(track.duration);
    }, 0);

    embed.addFields([
      {
        name: "Estimated Time Until Play",
        value: getQueueDuration({
          tracks: { size: timeUntilPlay },
        } as GuildQueue),
        inline: true,
      },
    ]);
  }

  return embed;
}
