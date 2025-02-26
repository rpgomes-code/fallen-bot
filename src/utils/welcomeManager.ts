/**
 * Welcome system manager
 * Stores and manages welcome message settings per guild
 * In a production environment, this would use a database instead of in-memory storage
 */

export interface WelcomeSettings {
  enabled: boolean;
  channelId: string;
  message?: string;
  embedTitle?: string;
  embedColor?: string;
  footerText?: string;
  mentionUser: boolean;
  showRules: boolean;
  rulesChannelId?: string;
  imageUrl?: string;
}

// Default welcome settings
const defaultSettings: WelcomeSettings = {
  enabled: false,
  channelId: "",
  message:
    "Welcome to {server}, {user}! We're glad to have you here. You are member number {memberCount}.",
  embedTitle: "👋 New Member!",
  embedColor: "#0099ff",
  footerText: "Thanks for joining us!",
  mentionUser: true,
  showRules: false,
};

// In-memory storage for welcome settings (per guild)
// In a production bot, this would be stored in a database
export const welcomeSettings = new Map<string, WelcomeSettings>();

/**
 * Initialize welcome settings for a guild
 * @param guildId Guild ID
 * @returns The created or existing settings
 */
export function initWelcomeSettings(guildId: string): WelcomeSettings {
  if (!welcomeSettings.has(guildId)) {
    welcomeSettings.set(guildId, { ...defaultSettings });
  }
  return welcomeSettings.get(guildId)!;
}

/**
 * Get welcome settings for a guild
 * @param guildId Guild ID
 * @returns The settings, or undefined if not initialized
 */
export function getWelcomeSettings(
  guildId: string
): WelcomeSettings | undefined {
  return welcomeSettings.get(guildId);
}

/**
 * Update welcome settings for a guild
 * @param guildId Guild ID
 * @param settings Partial settings to update
 * @returns The updated settings
 */
export function updateWelcomeSettings(
  guildId: string,
  settings: Partial<WelcomeSettings>
): WelcomeSettings {
  const currentSettings = initWelcomeSettings(guildId);
  const updatedSettings = { ...currentSettings, ...settings };
  welcomeSettings.set(guildId, updatedSettings);
  return updatedSettings;
}

/**
 * Enable welcome system for a guild
 * @param guildId Guild ID
 * @param channelId Welcome channel ID
 * @returns The updated settings
 */
export function enableWelcome(
  guildId: string,
  channelId: string
): WelcomeSettings {
  return updateWelcomeSettings(guildId, { enabled: true, channelId });
}

/**
 * Disable welcome system for a guild
 * @param guildId Guild ID
 * @returns The updated settings
 */
export function disableWelcome(guildId: string): WelcomeSettings {
  return updateWelcomeSettings(guildId, { enabled: false });
}

/**
 * Set welcome message for a guild
 * @param guildId Guild ID
 * @param message Welcome message
 * @returns The updated settings
 */
export function setWelcomeMessage(
  guildId: string,
  message: string
): WelcomeSettings {
  return updateWelcomeSettings(guildId, { message });
}

/**
 * Set rules channel for welcome embeds
 * @param guildId Guild ID
 * @param showRules Whether to show rules
 * @param rulesChannelId Rules channel ID
 * @returns The updated settings
 */
export function setRulesChannel(
  guildId: string,
  showRules: boolean,
  rulesChannelId?: string
): WelcomeSettings {
  return updateWelcomeSettings(guildId, { showRules, rulesChannelId });
}

/**
 * Set welcome embed appearance
 * @param guildId Guild ID
 * @param embedTitle Embed title
 * @param embedColor Embed color (hex)
 * @param footerText Footer text
 * @param imageUrl Image URL
 * @returns The updated settings
 */
export function setWelcomeAppearance(
  guildId: string,
  embedTitle?: string,
  embedColor?: string,
  footerText?: string,
  imageUrl?: string
): WelcomeSettings {
  return updateWelcomeSettings(guildId, {
    embedTitle,
    embedColor,
    footerText,
    imageUrl,
  });
}
