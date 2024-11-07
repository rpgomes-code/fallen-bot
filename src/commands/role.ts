import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  GuildMember,
  Role,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Add or remove a role from a user")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role to a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to add the role to")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to add")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a role from a user")
        .addUserOption((option) =>
          option
            .setName("target")
            .setDescription("The user to remove the role from")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to remove")
            .setRequired(true)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server!",
        ephemeral: true,
      });
      return;
    }

    const target = interaction.options.getMember("target") as GuildMember;
    const roleOption = interaction.options.getRole("role");

    if (!roleOption) {
      await interaction.reply({
        content: "Role not found!",
        ephemeral: true,
      });
      return;
    }

    // Fetch the actual Role object from the guild
    const role = interaction.guild.roles.cache.get(roleOption.id);

    if (!role) {
      await interaction.reply({
        content: "Could not find that role in the server.",
        ephemeral: true,
      });
      return;
    }

    const subcommand = interaction.options.getSubcommand();

    // Check if the bot can manage the role
    if (role.managed) {
      await interaction.reply({
        content: "I cannot manage that role as it's integrated with a service.",
        ephemeral: true,
      });
      return;
    }

    // Check if the role is higher than the bot's role
    const botMember = interaction.guild.members.cache.get(
      interaction.client.user!.id
    );
    if (
      !botMember?.roles.highest.position ||
      role.position >= botMember.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "I cannot manage that role as it's higher than or equal to my highest role.",
        ephemeral: true,
      });
      return;
    }

    // Check if the user trying to assign the role has a higher role than the role they're trying to assign
    const memberExecuting = interaction.guild.members.cache.get(
      interaction.user.id
    );
    if (
      !memberExecuting?.roles.highest.position ||
      role.position >= memberExecuting.roles.highest.position
    ) {
      await interaction.reply({
        content:
          "You cannot manage this role as it's higher than or equal to your highest role.",
        ephemeral: true,
      });
      return;
    }

    try {
      if (subcommand === "add") {
        if (target.roles.cache.has(role.id)) {
          await interaction.reply({
            content: `${target} already has the ${role} role.`,
            ephemeral: true,
          });
          return;
        }
        await target.roles.add(role);
        await interaction.reply({
          content: `Successfully added the ${role} role to ${target}`,
          ephemeral: true,
        });
      } else if (subcommand === "remove") {
        if (!target.roles.cache.has(role.id)) {
          await interaction.reply({
            content: `${target} doesn't have the ${role} role.`,
            ephemeral: true,
          });
          return;
        }
        await target.roles.remove(role);
        await interaction.reply({
          content: `Successfully removed the ${role} role from ${target}`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error executing this command!",
        ephemeral: true,
      });
    }
  },
};

module.exports = command;
