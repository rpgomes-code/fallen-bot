import { ChatInputCommandInteraction, EmbedBuilder, User } from "discord.js";
import { getWarnings, Warning } from "../utils/warningManager";

export async function handleWarnList(interaction: ChatInputCommandInteraction) {
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

  try {
    // Fetch warnings for the user
    const warnings = await getWarnings(interaction.guild.id, targetUser.id);

    // Create response embed
    const embed = new EmbedBuilder()
      .setColor(warnings.length > 0 ? "#ffcc00" : "#00ff00")
      .setTitle(`⚠️ Warning History for ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .setTimestamp();

    if (warnings.length === 0) {
      embed.setDescription("This user has no warnings. 🎉");
    } else {
      embed.setDescription(
        `Found ${warnings.length} warning${
          warnings.length === 1 ? "" : "s"
        } for this user.`
      );

      // Add fields for each warning
      const warningFields = await Promise.all(
        warnings.map(async (warning, index) => {
          const moderator = await fetchModeratorInfo(
            interaction,
            warning.moderatorId
          );
          const timestamp = new Date(warning.timestamp).toLocaleString();

          return {
            name: `Warning #${index + 1} (ID: ${warning.id})`,
            value: [
              `**Reason:** ${warning.reason}`,
              `**Date:** ${timestamp}`,
              `**Moderator:** ${moderator}`,
            ].join("\n"),
            inline: false,
          };
        })
      );

      embed.addFields(warningFields);
    }

    // Respond to the moderator
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching warnings:", error);
    return interaction.editReply(
      `Failed to fetch warning history. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Helper function to fetch moderator display name if possible
async function fetchModeratorInfo(
  interaction: ChatInputCommandInteraction,
  moderatorId: string
): Promise<string> {
  try {
    // Try to fetch the user
    const moderator = await interaction.client.users.fetch(moderatorId);
    return `${moderator.tag} (${moderatorId})`;
  } catch (error) {
    // If we can't fetch the user, just return the ID
    return `Unknown User (${moderatorId})`;
  }
}
