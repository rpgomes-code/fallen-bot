import { BotClient } from "../types";
import { readdirSync } from "fs";
import { join } from "path";

export async function loadCommands(client: BotClient) {
  const commandsPath = join(__dirname, "..", "commands");
  const commandFiles = readdirSync(commandsPath).filter(
    (file) => file.endsWith(".ts") || file.endsWith(".js")
  );

  for (const file of commandFiles) {
    const filePath = join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
      console.log(`Loaded command: ${command.data.name}`);
    }
  }
}
