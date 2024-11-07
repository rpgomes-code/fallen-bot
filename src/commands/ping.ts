import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!")
    .toJSON(),

  async execute(interaction: ChatInputCommandInteraction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `Pong! 🏓\nLatency: ${latency}ms\nAPI Latency: ${apiLatency}ms`
    );
  },
};

module.exports = command;
