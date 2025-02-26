import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";
import { addWarning, getWarnings } from "../utils/warningManager";
import { checkModeratorPermissions } from "../utils/permissionChecks";

export async function handleWarn(interaction: ChatInputCommandInteraction) {
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

  // Get the reason (required for warnings)
  const reason = interaction.options.getString("reason", true);

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
    // Add the warning to our system
    const warningId = await addWarning(
      interaction.guild.id,
      targetUser.id,
      reason,
      interaction.user.id
    );

    // Get current warnings count
    const warnings = await getWarnings(interaction.guild.id, targetUser.id);
    const warningCount = warnings.length;

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.WARN.color)
      .setTitle(`${MOD_ACTIONS.WARN.emoji} User Warned`)
      .setDescription(`Successfully warned ${targetUser.tag}`)
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})` },
        { name: "Warning ID", value: warningId },
        { name: "Reason", value: reason },
        { name: "Total Warnings", value: warningCount.toString() },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(
      interaction,
      MOD_ACTIONS.WARN,
      targetUser,
      reason,
      `Warning #${warningCount}`
    );

    // Try to DM the user about the warning
    try {
      const userEmbed = new EmbedBuilder()
        .setColor(MOD_ACTIONS.WARN.color)
        .setTitle(`${MOD_ACTIONS.WARN.emoji} Warning Received`)
        .setDescription(
          `You have received a warning in ${interaction.guild.name}`
        )
        .addFields(
          { name: "Warning ID", value: warningId },
          { name: "Reason", value: reason },
          { name: "Total Warnings", value: warningCount.toString() }
        )
        .setFooter({
          text: "If you believe this was a mistake, please contact a server administrator.",
        })
        .setTimestamp();

      await targetUser.send({ embeds: [userEmbed] });
      successEmbed.setFooter({ text: "User has been notified via DM." });
    } catch (dmError) {
      // If we can't DM the user (e.g. they have DMs disabled)
      console.log(`Couldn't send warning DM to ${targetUser.tag}: ${dmError}`);
      successEmbed.setFooter({
        text: "Could not notify user via DM (they may have DMs disabled).",
      });
    }

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error warning user:", error);
    return interaction.editReply(
      `Failed to warn ${targetUser.tag}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
