import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Display information about a user.")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to get information about")
        .setRequired(false)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("target") ?? interaction.user;
    const member = interaction.guild?.members.cache.get(target.id);

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(`User Information - ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: "Username", value: target.username, inline: true },
        { name: "User ID", value: target.id, inline: true },
        {
          name: "Account Created",
          value: target.createdAt.toLocaleDateString(),
          inline: true,
        },
        { name: "Is Bot", value: target.bot ? "Yes" : "No", inline: true }
      );

    if (member) {
      embed.addFields(
        {
          name: "Joined Server",
          value: member.joinedAt?.toLocaleDateString() || "Unknown",
          inline: true,
        },
        { name: "Nickname", value: member.nickname || "None", inline: true },
        {
          name: "Roles",
          value:
            member.roles.cache.map((role) => role.name).join(", ") || "None",
        }
      );
    }

    embed.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
