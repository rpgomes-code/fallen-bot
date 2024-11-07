import { Client, GatewayIntentBits, Collection } from "discord.js";
import { config } from "dotenv";
import { Command, BotClient } from "./types";
import { loadCommands } from "./handlers/commandHandler";
import { loadEvents } from "./handlers/eventHandler";

// Load environment variables
config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
}) as BotClient;

// Initialize commands collection
client.commands = new Collection<string, Command>();

// Load commands and events
(async () => {
  try {
    await loadCommands(client);
    await loadEvents(client);

    // Login to Discord
    await client.login(process.env.TOKEN);
    console.log("Bot is online!");
  } catch (error) {
    console.error("Error starting bot:", error);
  }
})();
