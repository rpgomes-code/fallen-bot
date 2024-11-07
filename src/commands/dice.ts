import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("dice")
    .setDescription("Roll one or more dice")
    .addIntegerOption((option) =>
      option
        .setName("sides")
        .setDescription("Number of sides on the dice (default: 6)")
        .setMinValue(2)
        .setMaxValue(100)
    )
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of dice to roll (default: 1)")
        .setMinValue(1)
        .setMaxValue(20)
    )
    .addBooleanOption((option) =>
      option
        .setName("sum")
        .setDescription("Show the sum of all dice (default: false)")
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const sides = interaction.options.getInteger("sides") ?? 6;
    const count = interaction.options.getInteger("count") ?? 1;
    const showSum = interaction.options.getBoolean("sum") ?? false;

    const rolls: number[] = [];
    let total = 0;

    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    const embed = new EmbedBuilder()
      .setTitle("🎲 Dice Roll")
      .setColor("#4169e1") // Royal Blue
      .setTimestamp()
      .setFooter({
        text: `Rolled by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    if (count === 1) {
      embed.setDescription(`You rolled a **${rolls[0]}**!`);
    } else {
      let description = `Rolling ${count} d${sides}...\n\n`;
      description += `Results: ${rolls.join(", ")}`;
      if (showSum) {
        description += `\n\nTotal: **${total}**`;
        const average = (total / count).toFixed(2);
        description += `\nAverage: **${average}**`;
      }
      embed.setDescription(description);
    }

    // Add some fun flavor text based on the rolls
    if (count > 1) {
      const highest = Math.max(...rolls);
      const lowest = Math.min(...rolls);

      if (highest === sides) {
        embed.addFields({
          name: "🌟 Critical Success!",
          value: `You rolled the highest possible number (${sides})!`,
        });
      }
      if (lowest === 1) {
        embed.addFields({
          name: "💫 Critical Fail!",
          value: "You rolled the lowest possible number (1)!",
        });
      }
    }

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
