import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { GuildQueue } from "discord-player";
import { handleCommandError } from "../utils/errorHandler";
import { BotClient } from "../../../types";
import { parseTimestamp, formatDuration } from "../utils/timeUtils";
import { getQueueProgressBar } from "../utils/queueUtils";

type PlaybackCommand = "volume" | "seek" | "nowplaying";

export async function handlePlayback(
  interaction: ChatInputCommandInteraction,
  command: PlaybackCommand
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
      case "volume":
        return handleVolume(interaction, queue);
      case "seek":
        return handleSeek(interaction, queue);
      case "nowplaying":
        return handleNowPlaying(interaction, queue);
    }
  } catch (error) {
    return handleCommandError(interaction, command, error);
  }
}

async function handleVolume(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    const volume = interaction.options.getInteger("percentage", true);

    if (volume < 0 || volume > 100) {
      return interaction.editReply({
        content: "❌ | Volume must be between 0 and 100!",
      });
    }

    const oldVolume = queue.node.volume;
    queue.node.setVolume(volume);

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🔊 Volume Changed")
      .setDescription(
        `Volume ${
          oldVolume > volume ? "decreased" : "increased"
        } from ${oldVolume}% to ${volume}%`
      )
      .addFields([
        {
          name: "Now Playing",
          value: queue.currentTrack
            ? `[${queue.currentTrack.title}](${queue.currentTrack.url})`
            : "No track playing",
          inline: false,
        },
      ])
      .setTimestamp();

    if (volume === 0) {
      embed.setFooter({
        text: "Tip: The music is now muted. Use /music volume to unmute.",
      });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "volume", error);
  }
}

async function handleSeek(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    const timestamp = interaction.options.getString("timestamp", true);
    const parsedTime = parseTimestamp(timestamp);

    if (!parsedTime.isValid) {
      return interaction.editReply({
        content: `❌ | ${parsedTime.error || "Invalid timestamp format!"}`,
      });
    }

    const seekTime = parsedTime.seconds!;
    const totalDuration = formatDuration(
      queue.node.getTimestamp()?.total.value || 0
    );

    try {
      await queue.node.seek(seekTime * 1000); // Convert to milliseconds
    } catch (seekError) {
      console.error("Error during seek operation:", seekError);
      return interaction.editReply({
        content:
          "❌ | Failed to seek to the specified position. The timestamp might be beyond the track duration.",
      });
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⏭️ Seeked Track")
      .setDescription(
        `Seeked to ${formatDuration(seekTime)} in [${currentTrack.title}](${
          currentTrack.url
        })`
      )
      .addFields([
        {
          name: "Track Duration",
          value: totalDuration,
          inline: true,
        },
        {
          name: "New Position",
          value: formatDuration(seekTime),
          inline: true,
        },
      ])
      .setThumbnail(currentTrack.thumbnail || null)
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "seek", error);
  }
}

async function handleNowPlaying(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    const currentTrack = queue.currentTrack;
    if (!currentTrack) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    const timestamp = queue.node.getTimestamp();
    if (!timestamp) {
      return interaction.editReply({
        content: "❌ | Unable to get track progress!",
      });
    }

    const progress = getQueueProgressBar(queue);
    const volume = queue.node.volume;
    const loop = queue.repeatMode;
    const totalTime = timestamp.total.value;
    const currentTime = timestamp.current.value;

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("🎵 Now Playing")
      .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
      .addFields([
        {
          name: "Progress",
          value: `${progress}\n${formatDuration(
            currentTime
          )} / ${formatDuration(totalTime)}`,
          inline: false,
        },
        {
          name: "Artist",
          value: currentTrack.author || "Unknown artist",
          inline: true,
        },
        {
          name: "Volume",
          value: `${volume}%`,
          inline: true,
        },
        {
          name: "Loop Mode",
          value: ["Off", "Track", "Queue"][loop],
          inline: true,
        },
        {
          name: "Requested By",
          value: currentTrack.requestedBy?.tag || "Unknown",
          inline: true,
        },
      ])
      .setThumbnail(currentTrack.thumbnail || null)
      .setTimestamp();

    // Add queue information if there are tracks in queue
    if (queue.tracks.size > 0) {
      const nextTrack = queue.tracks.at(0);
      if (nextTrack) {
        embed.addFields([
          {
            name: "Up Next",
            value: `[${nextTrack.title}](${nextTrack.url})`,
            inline: false,
          },
        ]);
      }
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "nowplaying", error);
  }
}
