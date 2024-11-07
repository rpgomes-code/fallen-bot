import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

interface RarityLevel {
  color: number;
  label: string;
  emoji: string;
}

const rarityLevels: { [key: string]: RarityLevel } = {
  impossible: {
    color: 0xff0000, // Red
    label: "Almost Impossible!",
    emoji: "💀",
  },
  rare: {
    color: 0x808080, // Gray
    label: "Rare",
    emoji: "⚪",
  },
  uncommon: {
    color: 0x00ff00, // Green
    label: "Uncommon",
    emoji: "🟢",
  },
  veryRare: {
    color: 0xcc00ff, // Purple
    label: "Very Rare",
    emoji: "⭐",
  },
  extraRare: {
    color: 0xffd700, // Gold
    label: "EXTRA RARE!!!",
    emoji: "🌟",
  },
};

function getRarityLevel(percentage: number): RarityLevel {
  if (percentage < 0) return rarityLevels.impossible;
  if (percentage <= 30) return rarityLevels.rare;
  if (percentage <= 60) return rarityLevels.uncommon;
  if (percentage <= 99) return rarityLevels.veryRare;
  return rarityLevels.extraRare;
}

function generateRandomPercentage(): number {
  // 0.1% chance for negative value (-1000%)
  if (Math.random() < 0.001) return -1000;

  // 0.5% chance for exactly 100%
  if (Math.random() < 0.005) return 100;

  // Otherwise, generate a number between 0 and 99
  return Math.floor(Math.random() * 100);
}

function getProgressBar(percentage: number): string {
  const totalBars = 10;
  const filledBars = Math.round((Math.abs(percentage) / 100) * totalBars);
  const emptyBars = totalBars - filledBars;

  return "█".repeat(filledBars) + "░".repeat(emptyBars);
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("howgay")
    .setDescription("Check how gay someone is")
    .addUserOption((option) =>
      option
        .setName("target")
        .setDescription("The user to check")
        .setRequired(false)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser("target") ?? interaction.user;
    const percentage = generateRandomPercentage();
    const rarity = getRarityLevel(percentage);

    const embed = new EmbedBuilder()
      .setColor(rarity.color)
      .setTitle(`${rarity.emoji} Gay Rating Machine ${rarity.emoji}`)
      .setDescription(`Calculating gayness for ${target}...`)
      .addFields([
        {
          name: "Result",
          value: `${target} is ${percentage}% gay 🏳️‍🌈`,
          inline: false,
        },
        {
          name: "Rarity",
          value: `${rarity.emoji} ${rarity.label}`,
          inline: true,
        },
        {
          name: "Progress",
          value: `${getProgressBar(percentage)} ${Math.abs(percentage)}%`,
          inline: false,
        },
      ])
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    // Add the user's avatar as thumbnail
    embed.setThumbnail(target.displayAvatarURL({ size: 256 }));

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
