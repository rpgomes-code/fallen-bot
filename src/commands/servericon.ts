import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("Display the server's icon.")
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "This command can only be used in a server!",
        ephemeral: true,
      });
      return;
    }

    const icon = interaction.guild.iconURL({ size: 1024 });

    if (!icon) {
      await interaction.reply({
        content: "This server has no icon!",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${interaction.guild.name}'s Icon`)
      .setColor("#0099ff")
      .setImage(icon)
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
