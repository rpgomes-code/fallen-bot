import { ChatInputCommandInteraction } from "discord.js";

export async function handleCommandError(
  interaction: ChatInputCommandInteraction,
  command?: string,
  error?: unknown
) {
  console.error(
    `Error in music command${command ? ` (${command})` : ""}:`,
    error
  );

  const errorMessage = {
    content: `❌ | ${
      command
        ? `An error occurred while processing the ${command} command!`
        : "An unexpected error occurred!"
    }`,
  };

  try {
    if (interaction.deferred) {
      return interaction.editReply(errorMessage);
    } else {
      return interaction.reply({ ...errorMessage, ephemeral: true });
    }
  } catch (replyError) {
    console.error("Error sending error response:", replyError);
  }
}

export function logError(context: string, error: unknown) {
  console.error(`[Music Bot Error] ${context}:`, error);
}
