import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { GuildQueue } from "discord-player";
import { handleCommandError } from "../utils/errorHandler";
import { BotClient } from "../../../types";

type ControlCommand = "pause" | "resume" | "skip" | "stop";

export async function handleControls(
  interaction: ChatInputCommandInteraction,
  command: ControlCommand
) {
  try {
    // Defer reply immediately to prevent timeout
    await interaction.deferReply();

    const client = interaction.client as BotClient;
    const queue = client.player.nodes.get(interaction.guildId!);

    if (!queue) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    switch (command) {
      case "pause":
        return handlePause(interaction, queue);
      case "resume":
        return handleResume(interaction, queue);
      case "skip":
        return handleSkip(interaction, queue);
      case "stop":
        return handleStop(interaction, queue);
    }
  } catch (error) {
    return handleCommandError(interaction, command, error);
  }
}

async function handlePause(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.isPlaying()) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    if (queue.node.isPaused()) {
      return interaction.editReply({
        content: "❌ | The music is already paused!",
      });
    }

    queue.node.pause();

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⏸️ Paused")
      .setDescription(
        queue.currentTrack
          ? `Paused [${queue.currentTrack.title}](${queue.currentTrack.url})`
          : "Paused the current track"
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "pause", error);
  }
}

async function handleResume(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.node.isPaused()) {
      return interaction.editReply({
        content: "❌ | The music is not paused!",
      });
    }

    queue.node.resume();

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("▶️ Resumed")
      .setDescription(
        queue.currentTrack
          ? `Resumed [${queue.currentTrack.title}](${queue.currentTrack.url})`
          : "Resumed the current track"
      )
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "resume", error);
  }
}

async function handleSkip(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.isPlaying()) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    const currentTrack = queue.currentTrack;
    const tracksLeft = queue.tracks.size;

    queue.node.skip();

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⏭️ Skipped Track")
      .setTimestamp();

    if (currentTrack) {
      embed.addFields([
        {
          name: "Skipped",
          value: `[${currentTrack.title}](${currentTrack.url})`,
          inline: false,
        },
      ]);
    }

    if (tracksLeft > 0) {
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
    } else {
      embed.setDescription("No more tracks in queue");
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "skip", error);
  }
}

async function handleStop(
  interaction: ChatInputCommandInteraction,
  queue: GuildQueue
) {
  try {
    if (!queue.isPlaying()) {
      return interaction.editReply({
        content: "❌ | No music is currently playing!",
      });
    }

    const currentTrack = queue.currentTrack;
    const tracksCleared = queue.tracks.size;

    queue.delete();

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle("⏹️ Stopped Playing")
      .setTimestamp();

    if (currentTrack) {
      embed.addFields([
        {
          name: "Stopped Playing",
          value: `[${currentTrack.title}](${currentTrack.url})`,
          inline: false,
        },
      ]);
    }

    if (tracksCleared > 0) {
      embed.addFields([
        {
          name: "Cleared Queue",
          value: `Removed ${tracksCleared} track${
            tracksCleared === 1 ? "" : "s"
          } from the queue`,
          inline: false,
        },
      ]);
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "stop", error);
  }
}
