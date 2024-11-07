import { EmbedBuilder, TextChannel } from "discord.js";
import { Player, GuildQueue } from "discord-player";
import type { BotClient } from "../types";

module.exports = {
  name: "ready",
  once: true,
  execute(client: BotClient) {
    // playerStart event
    client.player.events.on("playerStart", (queue, track) => {
      const channel = queue.metadata.channel as TextChannel;
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎵 Now Playing")
        .setDescription(`${track.title} - ${track.author}`)
        .addFields(
          { name: "Duration", value: track.duration, inline: true },
          {
            name: "Requested By",
            value: track.requestedBy?.tag ?? "Unknown",
            inline: true,
          }
        )
        .setThumbnail(track.thumbnail)
        .setTimestamp();

      channel.send({ embeds: [embed] }).catch(console.error);
    });

    // error event
    client.player.events.on("error", (queue, error) => {
      console.error(`Error: ${error.message}`);
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        channel
          .send(`❌ | An error occurred: ${error.message}`)
          .catch(console.error);
      }
    });

    // emptyChannel event
    client.player.events.on("emptyChannel", (queue) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        channel
          .send("❌ | Nobody is in the voice channel, leaving...")
          .catch(console.error);
      }
    });

    // emptyQueue event
    client.player.events.on("emptyQueue", (queue) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        channel.send("✅ | Queue finished!").catch(console.error);
      }
    });

    // playerError event
    client.player.events.on("playerError", (queue, error) => {
      console.error(`Player error: ${error.message}`);
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        channel
          .send(`❌ | A player error occurred: ${error.message}`)
          .catch(console.error);
      }
    });

    // debug event
    client.player.events.on("debug", (queue, message) => {
      console.debug(`Player debug: ${message}`);
    });

    // audioTrackAdd event (replaces trackAdd)
    client.player.events.on("audioTrackAdd", (queue, track) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("🎵 Track Added")
          .setDescription(`Added [${track.title}](${track.url}) to the queue.`)
          .addFields(
            { name: "Duration", value: track.duration, inline: true },
            {
              name: "Requested By",
              value: track.requestedBy?.tag ?? "Unknown",
              inline: true,
            }
          )
          .setThumbnail(track.thumbnail)
          .setTimestamp();

        channel.send({ embeds: [embed] }).catch(console.error);
      }
    });

    // audioTracksAdd event (for playlists)
    client.player.events.on("audioTracksAdd", (queue, tracks) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("🎵 Playlist Added")
          .setDescription(`Added ${tracks.length} tracks to the queue.`)
          .setTimestamp();

        channel.send({ embeds: [embed] }).catch(console.error);
      }
    });

    // playerSkip event (replaces trackEnd)
    client.player.events.on("playerSkip", (queue, track) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("⏭️ Track Skipped")
          .setDescription(`Skipped: [${track.title}](${track.url})`)
          .setTimestamp();

        channel.send({ embeds: [embed] }).catch(console.error);
      }
    });

    // disconnect event
    client.player.events.on("disconnect", (queue) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        channel
          .send("🔌 | Disconnected from the voice channel.")
          .catch(console.error);
      }
    });

    // playerFinish event
    client.player.events.on("playerFinish", (queue, track) => {
      const channel = queue.metadata.channel as TextChannel;
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("✅ Track Finished")
          .setDescription(`Finished playing: [${track.title}](${track.url})`)
          .setTimestamp();

        channel.send({ embeds: [embed] }).catch(console.error);
      }
    });
  },
};
