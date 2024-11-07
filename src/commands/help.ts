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
    usage?: string;
    examples?: string[];
  }[];
}

const categories: CommandCategory[] = [
  {
    name: "Music",
    emoji: "🎵",
    description: "Music playback and control commands",
    commands: [
      {
        name: "play",
        description: "Play a song or playlist from YouTube/YouTube Music",
        usage: "/music play <song name or URL>",
        examples: [
          "/music play Never Gonna Give You Up",
          "/music play https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "/music play https://youtube.com/playlist?list=...",
        ],
      },
      {
        name: "queue",
        description: "View and manage the music queue",
        usage: "/music queue [page number]",
        examples: ["/music queue", "/music queue 2"],
      },
      {
        name: "nowplaying",
        description: "Show information about the currently playing track",
        usage: "/music nowplaying",
      },
      {
        name: "seek",
        description: "Seek to a specific position in the current track",
        usage: "/music seek <timestamp>",
        examples: ["/music seek 1:30", "/music seek 90"],
      },
      {
        name: "loop",
        description: "Set the loop mode (off/track/queue)",
        usage: "/music loop <mode>",
        examples: ["/music loop off", "/music loop track", "/music loop queue"],
      },
      {
        name: "controls",
        description: "Basic playback controls",
        usage: "/music <command>",
        examples: [
          "/music pause - Pause playback",
          "/music resume - Resume playback",
          "/music skip - Skip current track",
          "/music stop - Stop playback",
        ],
      },
      {
        name: "volume",
        description: "Adjust the playback volume (1-100)",
        usage: "/music volume <percentage>",
        examples: ["/music volume 50", "/music volume 100"],
      },
      {
        name: "shuffle",
        description: "Shuffle the current queue",
        usage: "/music shuffle",
      },
      {
        name: "clear",
        description: "Clear the current queue",
        usage: "/music clear",
      },
    ],
  },
  {
    name: "Utility",
    emoji: "🛠️",
    description: "Utility and information commands",
    commands: [
      {
        name: "help",
        description: "Show this help message",
        usage: "/help [category]",
        examples: ["/help", "/help music"],
      },
      {
        name: "ping",
        description: "Check the bot's latency",
        usage: "/ping",
      },
      {
        name: "info",
        description: "Display bot information",
        usage: "/info",
      },
    ],
  },
  {
    name: "Fun",
    emoji: "🎮",
    description: "Fun and entertainment commands",
    commands: [
      {
        name: "8ball",
        description: "Ask the magic 8-ball a question",
        usage: "/8ball <question>",
        examples: ["/8ball Will I win the lottery?"],
      },
      {
        name: "coinflip",
        description: "Flip a coin",
        usage: "/coinflip [times]",
        examples: ["/coinflip", "/coinflip 10"],
      },
      {
        name: "dice",
        description: "Roll one or more dice",
        usage: "/dice [sides] [count]",
        examples: ["/dice", "/dice 20", "/dice 6 4"],
      },
    ],
  },
];

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows all available commands.")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Specific command category to show")
        .addChoices(
          { name: "🎵 Music", value: "music" },
          { name: "🛠️ Utility", value: "utility" },
          { name: "🎮 Fun", value: "fun" }
        )
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const category = interaction.options.getString("category")?.toLowerCase();
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
          return interaction.reply({
            content: "❌ | Invalid category selected!",
            ephemeral: true,
          });
        }

        embed
          .setTitle(
            `${selectedCategory.emoji} ${selectedCategory.name} Commands`
          )
          .setDescription(selectedCategory.description);

        // Group commands for better organization
        selectedCategory.commands.forEach((cmd) => {
          let fieldValue = cmd.description;

          if (cmd.usage) {
            fieldValue += `\n**Usage:** \`${cmd.usage}\``;
          }

          if (cmd.examples) {
            fieldValue +=
              "\n**Examples:**\n" +
              cmd.examples.map((ex) => `\`${ex}\``).join("\n");
          }

          embed.addFields({ name: cmd.name, value: fieldValue, inline: false });
        });
      } else {
        // Show categories overview
        embed
          .setTitle("📚 Help Menu")
          .setDescription(
            "Here are all available command categories. Use `/help [category]` to see specific commands."
          );

        categories.forEach((category) => {
          embed.addFields({
            name: `${category.emoji} ${category.name}`,
            value: `${category.description}\nCommands: \`${
              category.commands.length
            }\`\nUse \`/help ${category.name.toLowerCase()}\` for details`,
            inline: false,
          });
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

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Error in help command:", error);
      await interaction.reply({
        content: "An error occurred while showing the help menu.",
        ephemeral: true,
      });
    }
  },
};

module.exports = command;
