import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";
import { MOD_ACTIONS } from "../mod";
import { logModeration } from "../utils/modLogger";

export async function handleUnban(interaction: ChatInputCommandInteraction) {
  // Defer the reply to give us time to process
  await interaction.deferReply({ ephemeral: true });

  // Ensure this is used in a guild
  if (!interaction.guild) {
    return interaction.editReply("This command can only be used in a server!");
  }

  // Verify the moderator has permission to ban/unban
  if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
    return interaction.editReply("You don't have permission to unban members!");
  }

  // Get the user ID
  const userId = interaction.options.getString("user_id", true);

  // Get the reason if provided
  const reason =
    interaction.options.getString("reason") || "No reason provided";

  try {
    // Check if the user ID is valid
    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.editReply(
        "Invalid user ID format. The ID should be a number with 17-20 digits."
      );
    }

    // Check the ban list to make sure the user is actually banned
    const banList = await interaction.guild.bans.fetch();
    const bannedUser = banList.find((ban) => ban.user.id === userId);

    if (!bannedUser) {
      return interaction.editReply("That user is not banned from this server!");
    }

    // Unban the user
    await interaction.guild.members.unban(
      userId,
      `${reason} - By ${interaction.user.tag}`
    );

    // Create success embed
    const successEmbed = new EmbedBuilder()
      .setColor(MOD_ACTIONS.UNBAN.color)
      .setTitle(`${MOD_ACTIONS.UNBAN.emoji} User Unbanned`)
      .setDescription(`Successfully unbanned ${bannedUser.user.tag}`)
      .addFields(
        { name: "User", value: `${bannedUser.user.tag} (${userId})` },
        { name: "Reason", value: reason },
        { name: "Moderator", value: interaction.user.tag }
      )
      .setTimestamp();

    // Log the action
    await logModeration(
      interaction,
      MOD_ACTIONS.UNBAN,
      bannedUser.user,
      reason
    );

    // Respond to the moderator
    return interaction.editReply({ embeds: [successEmbed] });
  } catch (error) {
    console.error("Error unbanning user:", error);
    return interaction.editReply(
      `Failed to unban user. Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
