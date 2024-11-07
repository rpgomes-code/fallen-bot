import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Display information about the server.")
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const { guild } = interaction;

    if (!guild) {
      await interaction.reply("This command can only be used in a server!");
      return;
    }

    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL() ?? "")
      .addFields(
        {
          name: "Total Members",
          value: guild.memberCount.toString(),
          inline: true,
        },
        {
          name: "Created At",
          value: guild.createdAt.toLocaleDateString(),
          inline: true,
        },
        { name: "Server ID", value: guild.id, inline: true },
        { name: "Owner", value: `<@${guild.ownerId}>`, inline: true },
        {
          name: "Boost Level",
          value: guild.premiumTier.toString(),
          inline: true,
        },
        {
          name: "Boost Count",
          value: guild.premiumSubscriptionCount?.toString() ?? "0",
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
