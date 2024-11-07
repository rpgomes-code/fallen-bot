import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription(
      "Get the avatar URL of the selected user, or your own avatar."
    )
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user's avatar to show")
        .setRequired(false)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("target") ?? interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Avatar`)
      .setColor("#0099ff")
      .setImage(user.displayAvatarURL({ size: 1024 }))
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
