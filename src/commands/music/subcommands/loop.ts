import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { GuildQueue } from "discord-player";
import { handleCommandError } from "../utils/errorHandler";
import { BotClient } from "../../../types";
import { getLoopModeName } from "../utils/queueUtils";

type LoopMode = "off" | "track" | "queue";

interface LoopModeConfig {
  mode: number;
  emoji: string;
  description: string;
}

const loopModes: Record<LoopMode, LoopModeConfig> = {
  off: {
    mode: 0,
    emoji: "➡️",
    description: "Loop mode disabled. Playing queue normally.",
  },
  track: {
    mode: 1,
    emoji: "🔂",
    description: "Now looping the current track.",
  },
  queue: {
    mode: 2,
    emoji: "🔁",
    description: "Now looping the entire queue.",
  },
};

export async function handleLoop(interaction: ChatInputCommandInteraction) {
  try {
    await interaction.deferReply();

    const client = interaction.client as BotClient;
    const queue = client.player.nodes.get(interaction.guildId!);

    if (!queue) {
      return interaction.editReply({
        content: "❌ | No active music session found!",
      });
    }

    if (!queue.currentTrack) {
      return interaction.editReply({
        content: "❌ | No track is currently playing!",
      });
    }

    const requestedMode = interaction.options.getString(
      "mode",
      true
    ) as LoopMode;
    const modeConfig = loopModes[requestedMode];

    // Set the new loop mode
    queue.setRepeatMode(modeConfig.mode);

    // Create response embed
    const embed = createLoopEmbed(queue, modeConfig);

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    return handleCommandError(interaction, "loop", error);
  }
}

function createLoopEmbed(
  queue: GuildQueue,
  modeConfig: LoopModeConfig
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle(`${modeConfig.emoji} Loop Mode Changed`)
    .setDescription(modeConfig.description)
    .addFields([
      {
        name: "Current Track",
        value: queue.currentTrack
          ? `[${queue.currentTrack.title}](${queue.currentTrack.url})`
          : "No track playing",
        inline: false,
      },
    ])
    .setTimestamp();

  // Add queue information if relevant
  if (modeConfig.mode === loopModes.queue.mode && queue.tracks.size > 0) {
    embed.addFields([
      {
        name: "Queue Information",
        value: `${queue.tracks.size} track${
          queue.tracks.size === 1 ? "" : "s"
        } in queue`,
        inline: true,
      },
    ]);

    // Show next few tracks if in queue loop mode
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
  }

  // Add track duration for track loop mode
  if (modeConfig.mode === loopModes.track.mode && queue.currentTrack) {
    embed.addFields([
      {
        name: "Track Duration",
        value: queue.currentTrack.duration,
        inline: true,
      },
    ]);
  }

  // Add helpful tips based on the mode
  const tips: Record<LoopMode, string> = {
    off: "Use `/music loop track` or `/music loop queue` to enable looping",
    track:
      "The current track will play repeatedly. Use `/music loop off` to disable",
    queue: "All tracks will play repeatedly. Use `/music loop off` to disable",
  };

  embed.setFooter({
    text: `Tip: ${
      tips[
        modeConfig.mode === 0
          ? "off"
          : modeConfig.mode === 1
          ? "track"
          : "queue"
      ]
    }`,
  });

  return embed;
}
