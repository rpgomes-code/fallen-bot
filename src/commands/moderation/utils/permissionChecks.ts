import {
  ChatInputCommandInteraction,
  GuildMember,
  PermissionFlagsBits,
} from "discord.js";

/**
 * Permission type for moderation actions
 */
export type ModPermission = "KICK_MEMBERS" | "BAN_MEMBERS" | "MODERATE_MEMBERS";

/**
 * Result of a permission check
 */
export interface PermissionCheckResult {
  success: boolean;
  message: string;
}

/**
 * Check if the moderator has appropriate permissions to moderate the target member
 * Handles hierarchy checks, permission checks, and bot permission checks
 */
export async function checkModeratorPermissions(
  interaction: ChatInputCommandInteraction,
  targetMember: GuildMember,
  permission: ModPermission
): Promise<PermissionCheckResult> {
  // Destructure what we need
  const { guild, user, client, memberPermissions } = interaction;

  if (!guild) {
    return {
      success: false,
      message: "This command can only be used in a server!",
    };
  }

  // Check if moderator has the required permission
  const permissionFlag = getPermissionFlag(permission);
  if (!memberPermissions?.has(permissionFlag)) {
    return {
      success: false,
      message: `You don't have ${permission} permission!`,
    };
  }

  // Get the bot member
  const botMember = guild.members.cache.get(client.user!.id);
  if (!botMember) {
    return {
      success: false,
      message: "Failed to retrieve bot's member information.",
    };
  }

  // Check if bot has required permission
  if (!botMember.permissions.has(permissionFlag)) {
    return {
      success: false,
      message: `I don't have ${permission} permission!`,
    };
  }

  // Get the moderator member
  const modMember = guild.members.cache.get(user.id);
  if (!modMember) {
    return {
      success: false,
      message: "Failed to retrieve your member information.",
    };
  }

  // Check role hierarchy for moderator
  if (
    targetMember.roles.highest.position >= modMember.roles.highest.position &&
    guild.ownerId !== user.id
  ) {
    return {
      success: false,
      message:
        "You cannot moderate this user as they have an equal or higher role than you.",
    };
  }

  // Check role hierarchy for bot
  if (targetMember.roles.highest.position >= botMember.roles.highest.position) {
    return {
      success: false,
      message:
        "I cannot moderate this user as they have an equal or higher role than me.",
    };
  }

  // Check if target is the server owner
  if (guild.ownerId === targetMember.id) {
    return {
      success: false,
      message: "I cannot moderate the server owner.",
    };
  }

  // All checks passed
  return {
    success: true,
    message: "Permissions check passed.",
  };
}

/**
 * Convert the permission type to the corresponding permission flag
 */
function getPermissionFlag(permission: ModPermission): bigint {
  switch (permission) {
    case "KICK_MEMBERS":
      return PermissionFlagsBits.KickMembers;
    case "BAN_MEMBERS":
      return PermissionFlagsBits.BanMembers;
    case "MODERATE_MEMBERS":
      return PermissionFlagsBits.ModerateMembers;
    default:
      return 0n; // Return a default value (no permission)
  }
}
