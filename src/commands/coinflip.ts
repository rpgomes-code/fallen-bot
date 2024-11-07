import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Flip a coin")
    .addIntegerOption((option) =>
      option
        .setName("times")
        .setDescription("Number of times to flip the coin (max 100)")
        .setMinValue(1)
        .setMaxValue(100)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const times = interaction.options.getInteger("times") ?? 1;
    const results: string[] = [];
    let heads = 0;
    let tails = 0;

    for (let i = 0; i < times; i++) {
      const result = Math.random() < 0.5 ? "Heads" : "Tails";
      results.push(result);
      if (result === "Heads") heads++;
      else tails++;
    }

    const embed = new EmbedBuilder()
      .setTitle("🪙 Coin Flip")
      .setColor("#ffd700") // Gold color
      .setTimestamp()
      .setFooter({
        text: `Flipped by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    if (times === 1) {
      embed.setDescription(`The coin landed on: **${results[0]}**!`);
    } else {
      embed.addFields(
        { name: "Results", value: results.join(", "), inline: false },
        {
          name: "Statistics",
          value: `Heads: ${heads} (${((heads / times) * 100).toFixed(
            1
          )}%)\nTails: ${tails} (${((tails / times) * 100).toFixed(1)}%)`,
          inline: true,
        }
      );
    }

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
