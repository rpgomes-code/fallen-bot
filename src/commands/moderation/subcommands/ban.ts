import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";
import { checkModeratorPermissions } from "../utils/permissionChecks";

export async function handleBan(interaction: ChatInputCommandInteraction) {
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

  // Get the reason if provided
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  // Get the delete message days option
  const deleteMessageDays =
    interaction.options.getInteger("delete_messages") || 0;

  // Check for permission issues (if user is in the server)
  if (targetMember) {
    const permissionCheck = await checkModeratorPermissions(
      interaction,
      targetMember,
      "BAN_MEMBERS"
    );

    if (!permissionCheck.success) {
      return interaction.editReply(permissionCheck.message);
    }
  }

  try {
    // Execute the ban
    await interaction.guild.members.ban(targetUser, {
      reason: `${reason} - By ${interaction.user.tag}`,
      deleteMessageDays: deleteMessageDays,
    });

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.BAN.color)
      .setTitle(`${MOD_ACTIONS.BAN.emoji} User Banned`)
      .setDescription(`Successfully banned ${targetUser.tag}`)
      .addFields(
        { name: "User", value: `${targetUser.tag} (${targetUser.id})` },
        { name: "Reason", value: reason },
        {
          name: "Message History",
          value:
            deleteMessageDays > 0
              ? `Deleted messages from the last ${deleteMessageDays} day(s)`
              : "No messages deleted",
        },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(interaction, MOD_ACTIONS.BAN, targetUser, reason);

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error banning user:", error);
    return interaction.editReply(
      `Failed to ban ${targetUser.tag}. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
