import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const responses = [
  // Positive responses
  "It is certain.",
  "It is decidedly so.",
  "Without a doubt.",
  "Yes definitely.",
  "You may rely on it.",
  "As I see it, yes.",
  "Most likely.",
  "Outlook good.",
  "Yes.",
  "Signs point to yes.",
  // Neutral responses
  "Reply hazy, try again.",
  "Ask again later.",
  "Better not tell you now.",
  "Cannot predict now.",
  "Concentrate and ask again.",
  // Negative responses
  "Don't count on it.",
  "My reply is no.",
  "My sources say no.",
  "Outlook not so good.",
  "Very doubtful.",
];

const getResponseColor = (response: string): number => {
  if (responses.indexOf(response) < 10) return 0x00ff00; // Green for positive
  if (responses.indexOf(response) < 15) return 0xffff00; // Yellow for neutral
  return 0xff0000; // Red for negative
};

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Ask the magic 8-ball a question")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The question you want to ask")
        .setRequired(true)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question", true);
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setTitle("🎱 Magic 8-Ball")
      .addFields(
        { name: "Question", value: question },
        { name: "Answer", value: response }
      )
      .setColor(getResponseColor(response))
      .setTimestamp()
      .setFooter({
        text: `Asked by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
