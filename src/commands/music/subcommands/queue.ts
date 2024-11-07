import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { GuildQueue } from "discord-player";
import { handleCommandError } from "../utils/errorHandler";
import { BotClient } from "../../../types";
import {
  getQueueStats,
  getQueueDisplayInfo,
  getLoopModeName,
  validateQueuePage,
  getQueueProgressBar,
  getQueueDuration,
} from "../utils/queueUtils";
import { formatDuration } from "../utils/timeUtils";

type QueueCommand = "queue" | "clear" | "shuffle";

export async function handleQueue(
  interaction: ChatInputCommandInteraction,
  command: QueueCommand
) {
  try {
    await interaction.deferReply();

    const client = interaction.client as BotClient;
    const queue = client.player.nodes.get(interaction.guildId!);

    if (!queue) {
      return interaction.editReply({
        content: "❌ | No active music session found!",
      });
    }

    switch (command) {
      case "queue":
        return handleQueueDisplay(interaction, queue);
      case "clear":
        return handleQueueClear(interaction, queue);
      case "shuffle":
        return handleQueueShuffle(interaction, queue);
    }
  } catch (error) {
    return handleCommandError(interaction, command, error);
  }
}

async function handleQueueDisplay(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    const page = interaction.options.getInteger("page") || 1;
    const currentTrack = queue.currentTrack;

    // Validate if there's anything playing
    if (!currentTrack && queue.tracks.size === 0) {
      return interaction.editReply({
        content: "❌ | No music is playing and the queue is empty!",
      });
    }

    // Validate page number
    const pageValidation = validateQueuePage(page, queue);
    if (!pageValidation.isValid) {
      return interaction.editReply({
        content: `❌ | ${pageValidation.error}`,
      });
    }

    // Get queue display information
    const { stats, trackList } = getQueueDisplayInfo(queue, page);

    // Get current playback progress
    const timestamp = queue.node.getTimestamp();
    const progress = timestamp
      ? `${formatDuration(timestamp.current.value)} / ${formatDuration(
          timestamp.total.value
        )}`
      : "Unknown progress";

    // Create the embed
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🎵 Music Queue")
      .setDescription(createQueueDescription(currentTrack, progress))
      .addFields([
        {
          name: "Up Next",
          value:
            trackList.length > 0 ? trackList.join("\n") : "No tracks in queue",
          inline: false,
        },
        {
          name: "Queue Stats",
          value: createQueueStats(stats, queue),
          inline: false,
        },
      ])
      .setFooter({
        text: `Page ${stats.currentPage}/${
          stats.totalPages
        } • Loop: ${getLoopModeName(queue.repeatMode)} • Volume: ${
          queue.node.volume
        }%`,
      })
      .setTimestamp();

    // Add progress bar for current track
    if (currentTrack) {
      const progressBar = getQueueProgressBar(queue);
      embed.addFields([
        {
          name: "Current Progress",
          value: progressBar + "\n" + progress,
          inline: false,
        },
      ]);
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "queue display", error);
  }
}

async function handleQueueClear(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.tracks.size) {
      return interaction.editReply({
        content: "❌ | Queue is already empty!",
      });
    }

    const trackCount = queue.tracks.size;
    const currentTrack = queue.currentTrack;
    queue.tracks.clear();

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🗑️ Queue Cleared")
      .setDescription(
        `Successfully removed ${trackCount} track${
          trackCount !== 1 ? "s" : ""
        } from the queue`
      )
      .setTimestamp();

    if (currentTrack) {
      embed.addFields([
        {
          name: "Currently Playing",
          value: `[${currentTrack.title}](${currentTrack.url})`,
          inline: false,
        },
      ]);
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "queue clear", error);
  }
}

async function handleQueueShuffle(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.tracks.size) {
      return interaction.editReply({
        content: "❌ | Not enough songs in the queue to shuffle!",
      });
    }

    queue.tracks.shuffle();
    const tracksCount = queue.tracks.size;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🔀 Queue Shuffled")
      .setDescription(
        `Successfully shuffled ${tracksCount} track${
          tracksCount !== 1 ? "s" : ""
        }!`
      )
      .setTimestamp();

    // Show next few tracks after shuffle
    const nextTracks = queue.tracks
      .toArray()
      .slice(0, 3)
      .map((track, index) => `${index + 1}. [${track.title}](${track.url})`);

    if (nextTracks.length > 0) {
      embed.addFields([
        {
          name: "Next Up",
          value: nextTracks.join("\n"),
          inline: false,
        },
      ]);
    }

    if (queue.currentTrack) {
      embed.addFields([
        {
          name: "Currently Playing",
          value: `[${queue.currentTrack.title}](${queue.currentTrack.url})`,
          inline: false,
        },
      ]);
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "queue shuffle", error);
  }
}

// Helper function to create queue description
function createQueueDescription(
  currentTrack: GuildQueue["currentTrack"],
  progress: string
): string {
  if (!currentTrack) return "No track currently playing";

  return [
    "**Now Playing:**",
    `[${currentTrack.title}](${currentTrack.url})`,
    `By: ${currentTrack.author}`,
    `Duration: ${progress}`,
    "\n**Queue:**",
  ].join("\n");
}

// Helper function to create queue stats
function createQueueStats(
  stats: ReturnType<typeof getQueueStats>,
  queue: GuildQueue
): string {
  const totalDuration = getQueueDuration(queue);
  return [
    `• Total tracks: ${stats.totalTracks}`,
    `• Total duration: ${totalDuration}`,
    `• Loop mode: ${getLoopModeName(queue.repeatMode)}`,
    `• Volume: ${queue.node.volume}%`,
  ].join("\n");
}
