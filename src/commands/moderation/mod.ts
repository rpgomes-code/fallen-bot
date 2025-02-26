import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
  User,
  Guild,
  TextChannel,
} from "discord.js";
import type { Command } from "../../types";
import { handleKick } from "./subcommands/kick";
import { handleBan } from "./subcommands/ban";
import { handleTimeout } from "./subcommands/timeout";
import { handleWarn } from "./subcommands/warn";
import { handleUnban } from "./subcommands/unban";
import { handleRemoveTimeout } from "./subcommands/removeTimeout";
import { handleWarnList } from "./subcommands/warnList";

// Map of moderation actions to names and emojis for logs
export const MOD_ACTIONS = {
  BAN: { name: "Ban", emoji: "🔨", color: 0xff0000 },
  KICK: { name: "Kick", emoji: "👢", color: 0xff9900 },
  TIMEOUT: { name: "Timeout", emoji: "⏰", color: 0xffcc00 },
  WARN: { name: "Warning", emoji: "⚠️", color: 0xffff00 },
  UNBAN: { name: "Unban", emoji: "🔓", color: 0x00ff00 },
  UNTIMEOUT: { name: "Remove Timeout", emoji: "⏱️", color: 0x00ffcc },
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("Moderation commands for server management")
    // Kick subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("kick")
        .setDescription("Kick a user from the server")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to kick")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for kicking")
            .setRequired(false)
        )
    )
    // Ban subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ban")
        .setDescription("Ban a user from the server")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to ban")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for banning")
            .setRequired(false)
        )
        .addIntegerOption((option) =>
          option
            .setName("delete_messages")
            .setDescription("Delete message history (in days)")
            .addChoices(
              { name: "Don't delete any", value: 0 },
              { name: "Previous 24 hours", value: 1 },
              { name: "Previous 3 days", value: 3 },
              { name: "Previous 7 days", value: 7 }
            )
            .setRequired(false)
        )
    )
    // Unban subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unban")
        .setDescription("Unban a user from the server")
        .addStringOption((option) =>
          option
            .setName("user_id")
            .setDescription("The ID of the user to unban")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for unbanning")
            .setRequired(false)
        )
    )
    // Timeout subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("timeout")
        .setDescription("Timeout a user for a specified duration")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to timeout")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Timeout duration (1m, 1h, 1d, etc.)")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for timeout")
            .setRequired(false)
        )
    )
    // Remove timeout subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove_timeout")
        .setDescription("Remove timeout from a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to remove timeout from")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for removing timeout")
            .setRequired(false)
        )
    )
    // Warn subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("warn")
        .setDescription("Issue a warning to a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to warn")
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for warning")
            .setRequired(true)
        )
    )
    // List warnings subcommand
    .addSubcommand((subcommand) =>
      subcommand
        .setName("warnings")
        .setDescription("View warnings for a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to check warnings for")
            .setRequired(true)
        )
    )
    // Set default permissions - require at least kick/ban members permission
    .setDefaultMemberPermissions(
      PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      // Verify this is used in a guild
      if (!interaction.guild) {
        await interaction.reply({
          content: "This command can only be used in a server!",
          ephemeral: true,
        });
        return;
      }

      // Get subcommand
      const subcommand = interaction.options.getSubcommand();

      // Route to the appropriate handler
      switch (subcommand) {
        case "kick":
          return handleKick(interaction);
        case "ban":
          return handleBan(interaction);
        case "unban":
          return handleUnban(interaction);
        case "timeout":
          return handleTimeout(interaction);
        case "remove_timeout":
          return handleRemoveTimeout(interaction);
        case "warn":
          return handleWarn(interaction);
        case "warnings":
          return handleWarnList(interaction);
        default:
          return interaction.reply({
            content: "Unknown subcommand!",
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error(`Error in moderation command:`, error);
      return interaction.reply({
        content: "An error occurred while executing this command!",
        ephemeral: true,
      });
    }
  },
};

export default command;
