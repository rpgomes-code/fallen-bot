import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  TextChannel,
  User,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";

/**
 * Simple utility to log moderation actions
 * Logs to console and tries to log to a channel named "mod-logs" if it exists
 */
export async function logModeration(
  interaction: ChatInputCommandInteraction,
  action: (typeof MOD_ACTIONS)[keyof typeof MOD_ACTIONS],
  target: User,
  reason: string,
  additionalInfo: string | null = null
): Promise<void> {
  if (!interaction.guild) return;

  // Create the embed for logs
  const embed = new EmbedBuilder()
    .setColor(action.color)
    .setTitle(`${action.emoji} ${action.name} Action`)
    .addFields(
      {
        name: "Target User",
        value: `${target.tag} (${target.id})`,
        inline: true,
      },
      {
        name: "Moderator",
        value: `${interaction.user.tag} (${interaction.user.id})`,
        inline: true,
      },
      { name: "Reason", value: reason }
    )
    .setTimestamp();

  // Add additional info if provided
  if (additionalInfo) {
    embed.addFields({ name: "Additional Info", value: additionalInfo });
  }

  // Add thumbnail of target user
  embed.setThumbnail(target.displayAvatarURL());

  // Log to console
  console.log(
    `[Moderation] ${action.name} | Target: ${target.tag} (${target.id}) | ` +
      `Moderator: ${interaction.user.tag} | Reason: ${reason}`
  );

  // Try to find a mod-logs channel
  try {
    // Look for channel named exactly "mod-logs"
    const logChannel = interaction.guild.channels.cache.find(
      (channel) => channel.name === "mod-logs" && channel.isTextBased()
    ) as TextChannel | undefined;

    // If found, send the log there
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    // Don't stop execution if mod log fails - just log to console
    console.error("Error sending mod log to channel:", error);
  }
}
