import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a poll")
    .addStringOption((option) =>
      option
        .setName("question")
        .setDescription("The poll question")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("options")
        .setDescription("Poll options (separate with commas)")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Poll duration in minutes (default: 5)")
        .setMinValue(1)
        .setMaxValue(60)
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const question = interaction.options.getString("question", true);
    const optionsString = interaction.options.getString("options", true);
    const duration = interaction.options.getInteger("duration") ?? 5;

    const options = optionsString.split(",").map((opt) => opt.trim());

    if (options.length < 2 || options.length > 10) {
      await interaction.reply({
        content:
          "Please provide between 2 and 10 options, separated by commas.",
        ephemeral: true,
      });
      return;
    }

    const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const pollOptions = options.map((opt, i) => `${emojis[i]} ${opt}`);

    const embed = new EmbedBuilder()
      .setTitle("📊 " + question)
      .setDescription(pollOptions.join("\n\n"))
      .setColor("#0099ff")
      .setFooter({
        text: `Poll ends in ${duration} minutes • Started by ${interaction.user.tag}`,
      })
      .setTimestamp();

    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    // Add reaction options
    for (let i = 0; i < options.length; i++) {
      await message.react(emojis[i]);
    }

    // End the poll after the duration
    setTimeout(async () => {
      const fetchedMessage = await message.fetch();
      const reactions = fetchedMessage.reactions.cache;

      const results = options.map((opt, i) => {
        const reaction = reactions.get(emojis[i]);
        const count = reaction ? reaction.count - 1 : 0; // Subtract 1 to exclude bot's reaction
        return `${emojis[i]} ${opt}: ${count} votes`;
      });

      const resultsEmbed = new EmbedBuilder()
        .setTitle("📊 Poll Results: " + question)
        .setDescription(results.join("\n\n"))
        .setColor("#00ff00")
        .setFooter({
          text: `Poll ended • Started by ${interaction.user.tag}`,
        })
        .setTimestamp();

      await interaction.editReply({ embeds: [resultsEmbed] });
    }, duration * 60000);
  },
};

module.exports = command;
