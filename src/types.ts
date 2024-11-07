import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Client,
  Collection,
} from "discord.js";

export interface Command {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody | SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
}

export interface BotClient extends Client {
  commands: Collection<string, Command>;
}
