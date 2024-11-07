import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

type RPSChoice = "rock" | "paper" | "scissors";

const choices: RPSChoice[] = ["rock", "paper", "scissors"];
const emojis = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

const winningCombos = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper",
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("rps")
    .setDescription("Play rock, paper, scissors!")
    .addStringOption((option) =>
      option
        .setName("choice")
        .setDescription("Choose your weapon!")
        .setRequired(true)
        .addChoices(
          { name: "🪨 Rock", value: "rock" },
          { name: "📄 Paper", value: "paper" },
          { name: "✂️ Scissors", value: "scissors" }
        )
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const userChoice = interaction.options.getString("choice") as RPSChoice;
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result: string;
    let color: number;

    if (userChoice === botChoice) {
      result = "It's a tie!";
      color = 0xffff00; // Yellow
    } else if (winningCombos[userChoice] === botChoice) {
      result = "You win!";
      color = 0x00ff00; // Green
    } else {
      result = "I win!";
      color = 0xff0000; // Red
    }

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle("🎮 Rock Paper Scissors")
      .addFields(
        {
          name: "Your Choice",
          value: `${emojis[userChoice]} ${
            userChoice.charAt(0).toUpperCase() + userChoice.slice(1)
          }`,
          inline: true,
        },
        {
          name: "My Choice",
          value: `${emojis[botChoice]} ${
            botChoice.charAt(0).toUpperCase() + botChoice.slice(1)
          }`,
          inline: true,
        },
        {
          name: "Result",
          value: result,
          inline: false,
        }
      )
      .setTimestamp()
      .setFooter({
        text: `Played by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
