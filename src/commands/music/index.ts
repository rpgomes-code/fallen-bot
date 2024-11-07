import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../../types";
import { handlePlay } from "./subcommands/play";
import { handleQueue } from "./subcommands/queue";
import { handleControls } from "./subcommands/controls";
import { handlePlayback } from "./subcommands/playback";
import { handleLoop } from "./subcommands/loop";
import { handleCommandError } from "./utils/errorHandler";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Music command system")
    // Play command
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play a song or playlist")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Song/playlist name or URL (YouTube/YouTube Music)")
            .setRequired(true)
        )
    )
    // Basic controls
    .addSubcommand((subcommand) =>
      subcommand.setName("pause").setDescription("Pause the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("resume").setDescription("Resume the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("skip").setDescription("Skip the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setDescription("Stop playing and clear the queue")
    )
    // Queue management
    .addSubcommand((subcommand) =>
      subcommand
        .setName("queue")
        .setDescription("Show the song queue")
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("Page number for the queue")
            .setRequired(false)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("clear").setDescription("Clear the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shuffle").setDescription("Shuffle the queue")
    )
    // Playback controls
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volume")
        .setDescription("Set the volume")
        .addIntegerOption((option) =>
          option
            .setName("percentage")
            .setDescription("Volume percentage (1-100)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("seek")
        .setDescription("Seek to a specific position in the current track")
        .addStringOption((option) =>
          option
            .setName("timestamp")
            .setDescription("Time to seek to (e.g., '1:30' or '90')")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nowplaying")
        .setDescription("Show currently playing song")
    )
    // Loop control
    .addSubcommand((subcommand) =>
      subcommand
        .setName("loop")
        .setDescription("Set loop mode")
        .addStringOption((option) =>
          option
            .setName("mode")
            .setDescription("Loop mode")
            .setRequired(true)
            .addChoices(
              { name: "Off", value: "off" },
              { name: "Track", value: "track" },
              { name: "Queue", value: "queue" }
            )
        )
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const subcommand = interaction.options.getSubcommand();

      // Handle basic permission and state checks
      const result = await handleBasicChecks(interaction);
      if (!result.success) {
        return interaction.reply({
          content: result.error,
          ephemeral: true,
        });
      }

      // Route to appropriate subcommand handler
      switch (subcommand) {
        case "play":
          return handlePlay(interaction);
        case "queue":
        case "clear":
        case "shuffle":
          return handleQueue(interaction, subcommand);
        case "pause":
        case "resume":
        case "skip":
        case "stop":
          return handleControls(interaction, subcommand);
        case "volume":
        case "seek":
        case "nowplaying":
          return handlePlayback(interaction, subcommand);
        case "loop":
          return handleLoop(interaction);
        default:
          return interaction.reply({
            content: "❌ | Unknown subcommand!",
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error("Main music command error:", error);
      return handleCommandError(interaction);
    }
  },
};

export default command;

// Helper function to check basic requirements
async function handleBasicChecks(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    return {
      success: false,
      error: "❌ | This command can only be used in a server!",
    };
  }

  const member = interaction.member;
  if (!member || !("voice" in member)) {
    return {
      success: false,
      error: "❌ | Could not determine your voice state!",
    };
  }

  const voiceChannel = member.voice.channel;
  if (!voiceChannel) {
    return {
      success: false,
      error: "❌ | You must be in a voice channel to use music commands!",
    };
  }

  // Check bot permissions
  const permissions = voiceChannel.permissionsFor(interaction.client.user!);
  if (
    !permissions?.has(PermissionFlagsBits.Connect) ||
    !permissions.has(PermissionFlagsBits.Speak)
  ) {
    return {
      success: false,
      error: "❌ | I need permissions to join and speak in your voice channel!",
    };
  }

  return { success: true };
}
