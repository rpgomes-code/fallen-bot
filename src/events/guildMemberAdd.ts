import {
  Events,
  GuildMember,
  EmbedBuilder,
  TextChannel,
  ColorResolvable,
} from "discord.js";
import { welcomeSettings } from "../utils/welcomeManager";

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member: GuildMember) {
    try {
      // Check if welcome system is enabled for this guild
      const settings = welcomeSettings.get(member.guild.id);
      if (!settings || !settings.enabled) return;

      // Find the welcome channel
      const welcomeChannel = member.guild.channels.cache.get(
        settings.channelId
      ) as TextChannel | undefined;

      if (!welcomeChannel || !welcomeChannel.isTextBased()) {
        console.error(
          `Welcome channel not found or not a text channel for guild ${member.guild.name}`
        );
        return;
      }

      // Create embed for welcome message
      const welcomeEmbed = new EmbedBuilder()
        .setColor((settings.embedColor || "#0099ff") as ColorResolvable)
        .setTitle(settings.embedTitle || `Welcome to ${member.guild.name}!`)
        .setDescription(
          formatWelcomeMessage(settings.message, member) ||
            `Welcome to the server, ${member}! We're glad to have you here.`
        )
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .addFields(
          {
            name: "User",
            value: member.user.tag,
            inline: true,
          },
          {
            name: "Account Created",
            value: member.user.createdAt.toLocaleDateString(),
            inline: true,
          },
          {
            name: "Member Count",
            value: `${member.guild.memberCount}`,
            inline: true,
          }
        )
        .setTimestamp()
        .setFooter({
          text: settings.footerText || `Welcome to ${member.guild.name}!`,
          iconURL: member.guild.iconURL() || undefined,
        });

      // Add server rules field if specified
      if (settings.showRules && settings.rulesChannelId) {
        welcomeEmbed.addFields({
          name: "📜 Server Rules",
          value: `Please check <#${settings.rulesChannelId}> to get started!`,
          inline: false,
        });
      }

      // Add custom image if set
      if (settings.imageUrl) {
        welcomeEmbed.setImage(settings.imageUrl);
      }

      // Send the welcome message
      await welcomeChannel.send({
        content: settings.mentionUser ? `${member}` : undefined,
        embeds: [welcomeEmbed],
      });

      console.log(
        `Sent welcome message for ${member.user.tag} in ${member.guild.name}`
      );
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  },
};

/**
 * Format the welcome message with user variables
 * @param message The message template
 * @param member The guild member
 * @returns Formatted message
 */
function formatWelcomeMessage(
  message: string | undefined,
  member: GuildMember
): string {
  if (!message) return "";

  return message
    .replace(/{user}/g, `${member}`)
    .replace(/{username}/g, member.user.username)
    .replace(/{tag}/g, member.user.tag)
    .replace(/{server}/g, member.guild.name)
    .replace(/{memberCount}/g, member.guild.memberCount.toString());
}
