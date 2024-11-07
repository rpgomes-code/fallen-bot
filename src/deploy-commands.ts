import { REST, Routes } from "discord.js";
import { config } from "dotenv";
import { join } from "path";
import { readdirSync } from "fs";
import { Command } from "./types";

// Load environment variables
config();

// Validate environment variables
const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!TOKEN) {
  throw new Error("Missing Discord bot token in .env file");
}

if (!CLIENT_ID) {
  throw new Error("Missing Client ID in .env file");
}

if (!GUILD_ID) {
  throw new Error("Missing Guild ID in .env file");
}

const commands: Command[] = [];
const commandsPath = join(__dirname, "commands");
const commandFiles = readdirSync(commandsPath).filter(
  (file) => file.endsWith(".ts") || file.endsWith(".js")
);

// Load commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if ("data" in command && "execute" in command) {
    commands.push(command.data);
    console.log(`Loaded command: ${command.data.name}`);
  } else {
    console.log(
      `[WARNING] The command at ${file} is missing a required "data" or "execute" property.`
    );
  }
}

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );
    console.log("Using Guild ID:", GUILD_ID);
    console.log("Using Client ID:", CLIENT_ID);

    // The put method is used to fully refresh all commands
    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      if (error.stack) {
        console.error("Stack:", error.stack);
      }
    } else {
      console.error("An unknown error occurred:", error);
    }
  }
})();
