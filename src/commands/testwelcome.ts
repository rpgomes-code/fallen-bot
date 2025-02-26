import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import type { Command } from "../types";
import { getWelcomeSettings } from "../utils/welcomeManager";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("testwelcome")
    .setDescription("Test the welcome message system with a simulated join")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("User to simulate joining (defaults to you)")
        .setRequired(false)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server!",
        ephemeral: true,
      });
    }

    // Check if welcome system is enabled
    const settings = getWelcomeSettings(interaction.guild.id);
    if (!settings || !settings.enabled) {
      return interaction.reply({
        content: "Welcome system is not enabled! Use `/welcome enable` first.",
        ephemeral: true,
      });
    }

    // Get target user (default to command user)
    const targetUser =
      interaction.options.getUser("target") || interaction.user;

    // Get the member object for the target
    const targetMember = await interaction.guild.members
      .fetch(targetUser.id)
      .catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: "Could not find that user in this server!",
        ephemeral: true,
      });
    }

    try {
      // Defer reply as we're going to simulate an event that might take some time
      await interaction.deferReply({ ephemeral: true });

      // Manually trigger the guildMemberAdd event handler
      const guildMemberAddEvent = require("../events/guildMemberAdd");
      await guildMemberAddEvent.execute(targetMember);

      return interaction.editReply({
        content: `Welcome message test completed for ${targetUser.tag}! Check the welcome channel.`,
      });
    } catch (error) {
      console.error("Error testing welcome message:", error);
      return interaction.editReply({
        content: `An error occurred while testing the welcome message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  },
};

module.exports = command;
