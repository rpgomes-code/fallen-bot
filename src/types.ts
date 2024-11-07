import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  Client,
  Collection,
  InteractionResponse,
  Message,
  TextChannel,
  User,
} from "discord.js";
import { Player } from "discord-player";

export interface Command {
  data: RESTPostAPIChatInputApplicationCommandsJSONBody | SlashCommandBuilder;
  execute: (
    interaction: ChatInputCommandInteraction
  ) => Promise<InteractionResponse | Message | void>;
}

export interface BotClient extends Client {
  commands: Collection<string, Command>;
  player: Player;
}

export interface QueueMetadata {
  channel: TextChannel;
  client: Client;
  requestedBy: User;
}
