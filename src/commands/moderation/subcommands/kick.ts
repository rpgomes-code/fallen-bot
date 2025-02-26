import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";
import { checkModeratorPermissions } from "../utils/permissionChecks";

export async function handleKick(interaction: ChatInputCommandInteraction) {
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

  // Check for permission issues
  const permissionCheck = await checkModeratorPermissions(
    interaction,
    targetMember,
    "KICK_MEMBERS"
  );

  if (!permissionCheck.success) {
    return interaction.editReply(permissionCheck.message);
  }

  try {
    // Execute the kick
    await targetMember.kick(`${reason} - By ${interaction.user.tag}`);

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.KICK.color)
      .setTitle(`${MOD_ACTIONS.KICK.emoji} User Kicked`)
      .setDescription(`Successfully kicked ${targetUser.tag}`)
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})` },
        { name: "Reason", value: reason },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(interaction, MOD_ACTIONS.KICK, targetUser, reason);

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error kicking user:", error);
    return interaction.editReply(
      `Failed to kick ${targetUser.tag}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
