import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  TextChannel,
  ColorResolvable,
} from "discord.js";
import type { Command } from "../types";
import {
  enableWelcome,
  disableWelcome,
  setWelcomeMessage,
  setRulesChannel,
  setWelcomeAppearance,
  getWelcomeSettings,
  initWelcomeSettings,
} from "../utils/welcomeManager";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("welcome")
    .setDescription("Manage the server welcome system")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable welcome messages")
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to send welcome messages to")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("disable").setDescription("Disable welcome messages")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message")
        .setDescription("Set the welcome message text")
        .addStringOption((option) =>
          option
            .setName("text")
            .setDescription(
              "Welcome message text (you can use {user}, {username}, {tag}, {server}, {memberCount})"
            )
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("appearance")
        .setDescription("Customize the welcome embed appearance")
        .addStringOption((option) =>
          option
            .setName("title")
            .setDescription("Embed title")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("Embed color (hex code, e.g. #0099ff)")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("footer")
            .setDescription("Footer text")
            .setRequired(false)
        )
        .addStringOption((option) =>
          option
            .setName("image")
            .setDescription("URL of an image to include in the embed")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("rules")
        .setDescription("Configure rules information in welcome messages")
        .addBooleanOption((option) =>
          option
            .setName("show")
            .setDescription("Whether to show rules info in welcome messages")
            .setRequired(true)
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Rules channel to reference")
            .setRequired(false)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("mention")
        .setDescription("Configure user mention in welcome messages")
        .addBooleanOption((option) =>
          option
            .setName("enabled")
            .setDescription("Whether to mention new users in welcome messages")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("preview")
        .setDescription("Preview the welcome message")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("status").setDescription("Check welcome system status")
    )
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server!",
        ephemeral: true,
      });
    }

    const subcommand = interaction.options.getSubcommand();

    try {
      // Handle different subcommands
      switch (subcommand) {
        case "enable":
          return handleEnableWelcome(interaction);
        case "disable":
          return handleDisableWelcome(interaction);
        case "message":
          return handleSetMessage(interaction);
        case "appearance":
          return handleSetAppearance(interaction);
        case "rules":
          return handleSetRules(interaction);
        case "mention":
          return handleSetMention(interaction);
        case "preview":
          return handlePreviewWelcome(interaction);
        case "status":
          return handleWelcomeStatus(interaction);
        default:
          return interaction.reply({
            content: "Unknown subcommand!",
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error(`Error in welcome command:`, error);
      return interaction.reply({
        content: "An error occurred while executing this command!",
        ephemeral: true,
      });
    }
  },
};

async function handleEnableWelcome(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel(
    "channel",
    true
  ) as TextChannel;

  if (!channel.isTextBased()) {
    return interaction.reply({
      content: "Please select a text channel for welcome messages!",
      ephemeral: true,
    });
  }

  const settings = enableWelcome(interaction.guild!.id, channel.id);

  // Initialize with defaults if not already set
  if (!settings.message) {
    setWelcomeMessage(
      interaction.guild!.id,
      "Welcome to {server}, {user}! We're glad to have you here. You are member number {memberCount}."
    );
  }

  return interaction.reply({
    content: `Welcome system enabled! Welcome messages will be sent to ${channel}.`,
    ephemeral: true,
  });
}

async function handleDisableWelcome(interaction: ChatInputCommandInteraction) {
  disableWelcome(interaction.guild!.id);
  return interaction.reply({
    content: "Welcome system disabled.",
    ephemeral: true,
  });
}

async function handleSetMessage(interaction: ChatInputCommandInteraction) {
  const message = interaction.options.getString("text", true);

  // Initialize settings if they don't exist
  initWelcomeSettings(interaction.guild!.id);

  setWelcomeMessage(interaction.guild!.id, message);
  return interaction.reply({
    content: "Welcome message updated!",
    ephemeral: true,
  });
}

async function handleSetAppearance(interaction: ChatInputCommandInteraction) {
  const title = interaction.options.getString("title");
  const color = interaction.options.getString("color");
  const footer = interaction.options.getString("footer");
  const image = interaction.options.getString("image");

  // Validate color format if provided
  if (color && !color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return interaction.reply({
      content: "Please provide a valid hex color code (e.g. #0099ff).",
      ephemeral: true,
    });
  }

  // Initialize settings if they don't exist
  initWelcomeSettings(interaction.guild!.id);

  // Update appearance settings
  setWelcomeAppearance(
    interaction.guild!.id,
    title || undefined,
    color || undefined,
    footer || undefined,
    image || undefined
  );

  return interaction.reply({
    content: "Welcome message appearance updated!",
    ephemeral: true,
  });
}

async function handleSetRules(interaction: ChatInputCommandInteraction) {
  const showRules = interaction.options.getBoolean("show", true);
  const rulesChannel = interaction.options.getChannel(
    "channel"
  ) as TextChannel | null;

  // Initialize settings if they don't exist
  initWelcomeSettings(interaction.guild!.id);

  if (showRules && !rulesChannel) {
    return interaction.reply({
      content: "Please specify a rules channel!",
      ephemeral: true,
    });
  }

  setRulesChannel(interaction.guild!.id, showRules, rulesChannel?.id);

  return interaction.reply({
    content: showRules
      ? `Welcome messages will now include a reference to the rules in ${rulesChannel}.`
      : "Welcome messages will no longer include rules information.",
    ephemeral: true,
  });
}

async function handleSetMention(interaction: ChatInputCommandInteraction) {
  const mentionEnabled = interaction.options.getBoolean("enabled", true);

  // Initialize settings if they don't exist
  const settings = initWelcomeSettings(interaction.guild!.id);

  // Update mention setting
  settings.mentionUser = mentionEnabled;

  return interaction.reply({
    content: mentionEnabled
      ? "New users will now be mentioned in welcome messages."
      : "New users will no longer be mentioned in welcome messages.",
    ephemeral: true,
  });
}

async function handlePreviewWelcome(interaction: ChatInputCommandInteraction) {
  const settings = getWelcomeSettings(interaction.guild!.id);

  if (!settings || !settings.enabled) {
    return interaction.reply({
      content: "Welcome system is not enabled! Use `/welcome enable` first.",
      ephemeral: true,
    });
  }

  // Find the welcome channel
  const welcomeChannel = interaction.guild!.channels.cache.get(
    settings.channelId
  ) as TextChannel | undefined;

  if (!welcomeChannel) {
    return interaction.reply({
      content:
        "Welcome channel not found! Please reconfigure with `/welcome enable`.",
      ephemeral: true,
    });
  }

  // Format welcome message
  const welcomeMessage =
    settings.message
      ?.replace(/{user}/g, `<@${interaction.user.id}>`)
      .replace(/{username}/g, interaction.user.username)
      .replace(/{tag}/g, interaction.user.tag)
      .replace(/{server}/g, interaction.guild!.name)
      .replace(/{memberCount}/g, interaction.guild!.memberCount.toString()) ||
    "";

  // Create preview embed
  const previewEmbed = new EmbedBuilder()
    .setColor((settings.embedColor || "#0099ff") as ColorResolvable)
    .setTitle(settings.embedTitle || `Welcome to ${interaction.guild!.name}!`)
    .setDescription(welcomeMessage)
    .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
    .addFields(
      {
        name: "User",
        value: interaction.user.tag,
        inline: true,
      },
      {
        name: "Account Created",
        value: interaction.user.createdAt.toLocaleDateString(),
        inline: true,
      },
      {
        name: "Member Count",
        value: `${interaction.guild!.memberCount}`,
        inline: true,
      }
    )
    .setTimestamp()
    .setFooter({
      text: settings.footerText || `Welcome to ${interaction.guild!.name}!`,
      iconURL: interaction.guild!.iconURL() || undefined,
    });

  // Add server rules field if specified
  if (settings.showRules && settings.rulesChannelId) {
    previewEmbed.addFields({
      name: "📜 Server Rules",
      value: `Please check <#${settings.rulesChannelId}> to get started!`,
      inline: false,
    });
  }

  // Add custom image if set
  if (settings.imageUrl) {
    previewEmbed.setImage(settings.imageUrl);
  }

  // Add note to show this is a preview
  previewEmbed.addFields({
    name: "⚠️ Preview Mode",
    value:
      "This is a preview of your welcome message. New members will see this when they join.",
    inline: false,
  });

  // Reply with the preview
  await interaction.reply({
    content: `**Preview of welcome message in ${welcomeChannel}**${
      settings.mentionUser
        ? `\nUser would be mentioned: <@${interaction.user.id}>`
        : ""
    }`,
    embeds: [previewEmbed],
    ephemeral: true,
  });
}

async function handleWelcomeStatus(interaction: ChatInputCommandInteraction) {
  const settings = getWelcomeSettings(interaction.guild!.id);

  if (!settings) {
    return interaction.reply({
      content: "Welcome system has not been configured for this server.",
      ephemeral: true,
    });
  }

  // Find the welcome channel
  const welcomeChannel = settings.channelId
    ? interaction.guild!.channels.cache.get(settings.channelId)
    : null;

  // Find the rules channel if set
  const rulesChannel = settings.rulesChannelId
    ? interaction.guild!.channels.cache.get(settings.rulesChannelId)
    : null;

  // Create status embed
  const statusEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("Welcome System Status")
    .addFields(
      {
        name: "Status",
        value: settings.enabled ? "✅ Enabled" : "❌ Disabled",
        inline: true,
      },
      {
        name: "Welcome Channel",
        value: welcomeChannel ? `<#${welcomeChannel.id}>` : "Not set",
        inline: true,
      },
      {
        name: "Mention User",
        value: settings.mentionUser ? "Yes" : "No",
        inline: true,
      },
      {
        name: "Show Rules",
        value: settings.showRules ? "Yes" : "No",
        inline: true,
      },
      {
        name: "Rules Channel",
        value: rulesChannel ? `<#${rulesChannel.id}>` : "Not set",
        inline: true,
      },
      {
        name: "Embed Color",
        value: settings.embedColor || "#0099ff",
        inline: true,
      }
    )
    .setTimestamp();

  // Add welcome message if set
  if (settings.message) {
    statusEmbed.addFields({
      name: "Welcome Message",
      value: `\`\`\`\n${settings.message}\n\`\`\``,
      inline: false,
    });
  }

  // Add embed title if set
  if (settings.embedTitle) {
    statusEmbed.addFields({
      name: "Embed Title",
      value: settings.embedTitle,
      inline: true,
    });
  }

  // Add footer text if set
  if (settings.footerText) {
    statusEmbed.addFields({
      name: "Footer Text",
      value: settings.footerText,
      inline: true,
    });
  }

  // Add image URL if set
  if (settings.imageUrl) {
    statusEmbed.addFields({
      name: "Image URL",
      value: settings.imageUrl,
      inline: false,
    });
    statusEmbed.setImage(settings.imageUrl);
  }

  return interaction.reply({
    embeds: [statusEmbed],
    ephemeral: true,
  });
}

module.exports = command;
