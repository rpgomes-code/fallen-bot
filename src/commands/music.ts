import { SlashCommandBuilder } from "discord.js";
import { Command } from "../types";
import { handlePlay } from "./music/subcommands/play";
import { handleControls } from "./music/subcommands/controls";
import { handlePlayback } from "./music/subcommands/playback";
import { handleQueue } from "./music/subcommands/queue";
import { handleLoop } from "./music/subcommands/loop";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Music command system")
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
      subcommand
        .setName("stop")
        .setDescription("Stop playing and clear the queue")
    )
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
        .setName("nowplaying")
        .setDescription("Show currently playing song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shuffle").setDescription("Shuffle the queue")
    )
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
    .toJSON(),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "play":
        return handlePlay(interaction);
      case "pause":
      case "resume":
      case "skip":
      case "stop":
        return handleControls(interaction, subcommand);
      case "volume":
      case "seek":
      case "nowplaying":
        return handlePlayback(interaction, subcommand);
      case "queue":
      case "clear":
      case "shuffle":
        return handleQueue(interaction, subcommand);
      case "loop":
        return handleLoop(interaction);
    }
  },
};

module.exports = command;
