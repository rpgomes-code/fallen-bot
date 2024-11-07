import { Client, GatewayIntentBits, Collection } from "discord.js";
import { Player } from "discord-player";
import { YoutubeiExtractor } from "discord-player-youtubei"; // Fixed import name
import { config } from "dotenv";
import { Command, BotClient } from "./types";
import { loadCommands } from "./handlers/commandHandler";
import { loadEvents } from "./handlers/eventHandler";

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
}) as BotClient;

// Initialize commands collection
client.commands = new Collection();

// Initialize the player with optimized options
client.player = new Player(client, {
  ytdlOptions: {
    quality: "highestaudio",
    highWaterMark: 1 << 25,
    filter: "audioonly",
  },
  skipFFmpeg: false, // Ensure FFmpeg is not skipped for better audio processing
});

// Load commands and events
(async () => {
  try {
    await loadCommands(client);
    await loadEvents(client);

    // Register the Youtubei extractor with the correct name
    await client.player.extractors.register(YoutubeiExtractor, {});

    // Optional: Add some debug logging
    client.player.events.on("debug", (message) => {
      console.debug(`[Player Debug] ${message}`);
    });

    // Login to Discord
    await client.login(process.env.TOKEN);
    console.log("Bot is online!");
  } catch (error) {
    console.error("Error starting bot:", error);
  }
})();
