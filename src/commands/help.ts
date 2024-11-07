import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import type { Command } from "../types";

interface CommandCategory {
  name: string;
  emoji: string;
  description: string;
  commands: {
    name: string;
    description: string;
  }[];
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands.")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Specific command category to show")
        .addChoices(
          { name: "📋 General", value: "general" },
          { name: "🛠️ Utility", value: "utility" },
          { name: "🎮 Fun", value: "fun" }
        )
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const categories: CommandCategory[] = [
      {
        name: "General",
        emoji: "📋",
        description: "Basic bot commands",
        commands: [
          { name: "help", description: "Shows this help message" },
          { name: "ping", description: "Check the bot's latency" },
          {
            name: "server",
            description: "Display information about the server",
          },
          { name: "user", description: "Display information about a user" },
        ],
      },
      {
        name: "Utility",
        emoji: "🛠️",
        description: "Useful server management and information commands",
        commands: [
          { name: "avatar", description: "Get the avatar URL of a user" },
          { name: "servericon", description: "Display the server's icon" },
          { name: "role", description: "Add or remove roles from users" },
          { name: "poll", description: "Create a poll for users to vote on" },
        ],
      },
      {
        name: "Fun",
        emoji: "🎮",
        description: "Entertainment and game commands",
        commands: [
          { name: "8ball", description: "Ask the magic 8-ball a question" },
          {
            name: "coinflip",
            description: "Flip a coin one or multiple times",
          },
          { name: "dice", description: "Roll one or more dice" },
        ],
      },
    ];

    const category = interaction.options.getString("category");
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setThumbnail(interaction.client.user!.displayAvatarURL())
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });

    if (category) {
      // Show specific category
      const selectedCategory = categories.find(
        (cat) => cat.name.toLowerCase() === category
      );
      if (!selectedCategory) {
        await interaction.reply({
          content: "Invalid category selected!",
          ephemeral: true,
        });
        return;
      }

      embed
        .setTitle(`${selectedCategory.emoji} ${selectedCategory.name} Commands`)
        .setDescription(selectedCategory.description)
        .addFields(
          selectedCategory.commands.map((cmd) => ({
            name: `/${cmd.name}`,
            value: cmd.description,
            inline: false,
          }))
        );
    } else {
      // Show all categories overview
      embed
        .setTitle("📚 Help Menu")
        .setDescription(
          "Here are all available command categories. Use `/help [category]` to see specific commands."
        )
        .addFields(
          categories.map((category) => ({
            name: `${category.emoji} ${category.name}`,
            value: `${category.description}\nCommands: \`${category.commands.length}\``,
            inline: false,
          }))
        );

      // Add usage example
      embed.addFields({
        name: "📝 Usage Example",
        value: "To see Utility commands, type: `/help utility`",
        inline: false,
      });
    }

    // Add additional help information
    const helpInfo = [
      "```",
      "[] = Optional parameter",
      "<> = Required parameter",
      "Use /help <category> for detailed command information",
      "```",
    ].join("\n");

    embed.addFields({
      name: "❔ Help Notes",
      value: helpInfo,
      inline: false,
    });

    await interaction.reply({ embeds: [embed] });
  },
};

module.exports = command;
