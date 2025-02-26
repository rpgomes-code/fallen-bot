import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";
import { checkModeratorPermissions } from "../utils/permissionChecks";

export async function handleRemoveTimeout(
  interaction: ChatInputCommandInteraction
) {
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

  // Get the reason if provided
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  // Check if the user is actually timed out
  if (!targetMember.communicationDisabledUntil) {
    return interaction.editReply("This user is not currently timed out.");
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
    // Remove timeout by setting it to null
    await targetMember.timeout(null, `${reason} - By ${interaction.user.tag}`);

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.UNTIMEOUT.color)
      .setTitle(`${MOD_ACTIONS.UNTIMEOUT.emoji} Timeout Removed`)
      .setDescription(`Successfully removed timeout from ${targetUser.tag}`)
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})` },
        { name: "Reason", value: reason },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(interaction, MOD_ACTIONS.UNTIMEOUT, targetUser, reason);

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error removing timeout:", error);
    return interaction.editReply(
      `Failed to remove timeout from ${targetUser.tag}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
