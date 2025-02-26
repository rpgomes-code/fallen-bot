/**
 * Simple in-memory warning system
 * In a production bot, you'd want to use a database instead of an in-memory store.
 */

// Type to represent a warning
export interface Warning {
  id: string;
  guildId: string;
  userId: string;
  reason: string;
  moderatorId: string;
  timestamp: number;
}

// In-memory storage (in a real bot, you'd use a database)
// Structure: Map<guildId, Map<userId, Warning[]>>
const warnings = new Map<string, Map<string, Warning[]>>();

/**
 * Generate a unique warning ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Add a warning to a user
 * @param guildId The guild ID
 * @param userId The user ID
 * @param reason The reason for the warning
 * @param moderatorId The moderator's ID
 * @returns The ID of the new warning
 */
export async function addWarning(
  guildId: string,
  userId: string,
  reason: string,
  moderatorId: string
): Promise<string> {
  // Create guild map if it doesn't exist
  if (!warnings.has(guildId)) {
    warnings.set(guildId, new Map<string, Warning[]>());
  }

  // Get guild warnings
  const guildWarnings = warnings.get(guildId)!;

  // Create user warnings array if it doesn't exist
  if (!guildWarnings.has(userId)) {
    guildWarnings.set(userId, []);
  }

  // Get user warnings
  const userWarnings = guildWarnings.get(userId)!;

  // Create new warning
  const warningId = generateId();
  const warning: Warning = {
    id: warningId,
    guildId,
    userId,
    reason,
    moderatorId,
    timestamp: Date.now(),
  };

  // Add warning to user's warnings
  userWarnings.push(warning);

  return warningId;
}

/**
 * Get all warnings for a user
 * @param guildId The guild ID
 * @param userId The user ID
 * @returns Array of warnings for the user
 */
export async function getWarnings(
  guildId: string,
  userId: string
): Promise<Warning[]> {
  // If guild not found, return empty array
  if (!warnings.has(guildId)) {
    return [];
  }

  // Get guild warnings
  const guildWarnings = warnings.get(guildId)!;

  // If user not found, return empty array
  if (!guildWarnings.has(userId)) {
    return [];
  }

  // Return user warnings sorted by timestamp (newest first)
  return [...guildWarnings.get(userId)!].sort(
    (a, b) => b.timestamp - a.timestamp
  );
}

/**
 * Remove a warning by ID
 * @param guildId The guild ID
 * @param warningId The warning ID to remove
 * @returns True if warning was found and removed, false otherwise
 */
export async function removeWarning(
  guildId: string,
  warningId: string
): Promise<boolean> {
  // If guild not found, return false
  if (!warnings.has(guildId)) {
    return false;
  }

  // Get guild warnings
  const guildWarnings = warnings.get(guildId)!;

  // Search all users in the guild for the warning
  for (const [userId, userWarnings] of guildWarnings.entries()) {
    // Find the warning by ID
    const warningIndex = userWarnings.findIndex((w) => w.id === warningId);

    // If found, remove it and return true
    if (warningIndex !== -1) {
      userWarnings.splice(warningIndex, 1);
      return true;
    }
  }

  // Warning not found
  return false;
}

/**
 * Clear all warnings for a user
 * @param guildId The guild ID
 * @param userId The user ID
 * @returns The number of warnings cleared
 */
export async function clearWarnings(
  guildId: string,
  userId: string
): Promise<number> {
  // If guild not found, return 0
  if (!warnings.has(guildId)) {
    return 0;
  }

  // Get guild warnings
  const guildWarnings = warnings.get(guildId)!;

  // If user not found, return 0
  if (!guildWarnings.has(userId)) {
    return 0;
  }

  // Get current count
  const count = guildWarnings.get(userId)!.length;

  // Clear warnings
  guildWarnings.set(userId, []);

  return count;
}

// For a production bot, you might want to add methods to:
// - Export warnings to JSON
// - Import warnings from JSON
// - Create a scheduled task to prune old warnings after X days
