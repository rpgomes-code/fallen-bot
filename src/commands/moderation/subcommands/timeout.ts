import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";
import { checkModeratorPermissions } from "../utils/permissionChecks";
import { parseTimeString } from "../utils/timeParser";

export async function handleTimeout(interaction: ChatInputCommandInteraction) {
  // Defer the reply to give us time to process
  await interaction.deferReply({ ephemeral: true });

  // Ensure this is used in a guild
  if (!interaction.guild) {
    return interaction.editReply("This command can only be used in a server!");
  }

  // Get the target user
  const targetUser = interaction.options.getUser("target");
  if (!targetUser) {
    return interaction.editReply("Failed to find the specified user.");
  }

  // Get the target member (in guild context)
  const targetMember = interaction.guild.members.cache.get(targetUser.id);
  if (!targetMember) {
    return interaction.editReply(
      "That user doesn't appear to be in this server."
    );
  }

  // Get the duration and reason
  const durationString = interaction.options.getString("duration", true);
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  // Parse the duration
  const durationMs = parseTimeString(durationString);
  if (durationMs === null) {
    return interaction.editReply(
      "Invalid duration format. Examples: 30s, 5m, 1h, 1d"
    );
  }

  // Check for maximum duration (28 days in milliseconds)
  const MAX_TIMEOUT_DURATION = 28 * 24 * 60 * 60 * 1000;
  if (durationMs > MAX_TIMEOUT_DURATION) {
    return interaction.editReply(
      "Timeout duration cannot exceed 28 days. Please specify a shorter duration."
    );
  }

  // Check for permission issues
  const permissionCheck = await checkModeratorPermissions(
    interaction,
    targetMember,
    "MODERATE_MEMBERS"
  );

  if (!permissionCheck.success) {
    return interaction.editReply(permissionCheck.message);
  }

  try {
    // Apply the timeout
    await targetMember.timeout(
      durationMs,
      `${reason} - By ${interaction.user.tag}`
    );

    // Format the duration for human reading
    const durationText = formatDuration(durationMs);

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.TIMEOUT.color)
      .setTitle(`${MOD_ACTIONS.TIMEOUT.emoji} User Timed Out`)
      .setDescription(`Successfully timed out ${targetUser.tag}`)
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})` },
        { name: "Duration", value: durationText },
        { name: "Reason", value: reason },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(
      interaction,
      MOD_ACTIONS.TIMEOUT,
      targetUser,
      reason,
      durationText
    );

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error timing out user:", error);
    return interaction.editReply(
      `Failed to timeout ${targetUser.tag}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Helper function to format duration in a human-readable format
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"}${
      hours % 24 > 0 ? ` ${hours % 24} hour${hours % 24 === 1 ? "" : "s"}` : ""
    }`;
  } else if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"}${
      minutes % 60 > 0
        ? ` ${minutes % 60} minute${minutes % 60 === 1 ? "" : "s"}`
        : ""
    }`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}${
      seconds % 60 > 0
        ? ` ${seconds % 60} second${seconds % 60 === 1 ? "" : "s"}`
        : ""
    }`;
  } else {
    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  }
}
