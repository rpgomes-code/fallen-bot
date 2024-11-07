import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  TextChannel,
  VoiceChannel,
  PermissionFlagsBits,
  Message,
  InteractionResponse,
  User,
} from "discord.js";
import { QueryType, SearchResult, Track, Player } from "discord-player";
import type { Command, BotClient } from "../types";

// Helper function to check if URL is from YouTube Music
function isYoutubeMusicURL(url: string): boolean {
  return url.includes("music.youtube.com");
}

// Helper function to convert YouTube Music URL to regular YouTube URL
function convertToYouTubeURL(url: string): string {
  return url.replace("music.youtube.com", "youtube.com");
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("music")
    .setDescription("Music command system")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Play a song or playlist")
        .addStringOption((option) =>
          option
            .setName("query")
            .setDescription("Song/playlist name or URL (YouTube/YouTube Music)")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("pause").setDescription("Pause the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("resume").setDescription("Resume the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("skip").setDescription("Skip the current song")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("queue")
        .setDescription("Show the song queue")
        .addIntegerOption((option) =>
          option
            .setName("page")
            .setDescription("Page number for the queue")
            .setRequired(false)
            .setMinValue(1)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("clear").setDescription("Clear the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("stop")
        .setDescription("Stop playing and clear the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("volume")
        .setDescription("Set the volume")
        .addIntegerOption((option) =>
          option
            .setName("percentage")
            .setDescription("Volume percentage (1-100)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("nowplaying")
        .setDescription("Show currently playing song")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("shuffle").setDescription("Shuffle the queue")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("loop")
        .setDescription("Set loop mode")
        .addStringOption((option) =>
          option
            .setName("mode")
            .setDescription("Loop mode")
            .setRequired(true)
            .addChoices(
              { name: "Off", value: "off" },
              { name: "Track", value: "track" },
              { name: "Queue", value: "queue" }
            )
        )
    )
    .toJSON(),

  async execute(
    interaction: ChatInputCommandInteraction
  ): Promise<InteractionResponse | Message | void> {
    try {
      if (!interaction.guild) {
        return interaction.reply({
          content: "❌ | This command can only be used in a server!",
          ephemeral: true,
        });
      }

      const member = interaction.member as GuildMember;
      const voiceChannel = member.voice.channel;

      if (!voiceChannel) {
        return interaction.reply({
          content: "❌ | You must be in a voice channel to use music commands!",
          ephemeral: true,
        });
      }

      // Check if the bot has necessary permissions
      const permissions = voiceChannel.permissionsFor(interaction.client.user!);
      if (
        !permissions?.has(PermissionFlagsBits.Connect) ||
        !permissions.has(PermissionFlagsBits.Speak)
      ) {
        return interaction.reply({
          content:
            "❌ | I need permissions to join and speak in your voice channel!",
          ephemeral: true,
        });
      }

      const client = interaction.client as BotClient;
      const player: Player = client.player;

      // Create a queue for the guild if it doesn't exist
      const queue = player.nodes.create(interaction.guild, {
        metadata: {
          channel: interaction.channel as TextChannel,
          client: interaction.client,
          requestedBy: interaction.user,
        },
        leaveOnEnd: false,
        leaveOnStop: false,
        leaveOnEmpty: true,
        volume: 80,
        bufferingTimeout: 3000,
      });

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case "play": {
          if (!queue.connection) {
            await queue.connect(voiceChannel);
          }

          let query = interaction.options.getString("query", true);
          await interaction.deferReply();

          try {
            // Handle YouTube Music URLs
            if (isYoutubeMusicURL(query)) {
              console.log("YouTube Music URL detected, converting...");
              query = convertToYouTubeURL(query);
            }

            // Determine if the query is a playlist
            const isPlaylist = query.includes("list=");

            // Search based on whether it's a playlist or single track
            const searchResult: SearchResult = await player.search(query, {
              requestedBy: interaction.user,
              searchEngine: isPlaylist
                ? QueryType.YOUTUBE_PLAYLIST
                : QueryType.YOUTUBE,
            });

            if (!searchResult || searchResult.tracks.length === 0) {
              return interaction.editReply("❌ | No results found!");
            }

            // Add the track(s) to the queue
            if (isPlaylist) {
              queue.addTrack(searchResult.tracks);
              await interaction.editReply({
                content: `✅ | Added ${searchResult.tracks.length} tracks from playlist: **${searchResult.playlist?.title}**`,
              });
            } else {
              // Check if the query is a YouTube video about game highlights or non-music content
              if (
                query.toLowerCase().includes("highlights") ||
                query.toLowerCase().includes("gameplay") ||
                query.toLowerCase().includes("game") ||
                query.toLowerCase().includes("full game")
              ) {
                return interaction.editReply(
                  "❌ | Please provide a music query. Game highlights and non-music content are not supported."
                );
              }

              // Add keywords to help find music content
              const searchQuery = `${query} official audio`;

              const musicTrack = await findMusicTrack(
                player,
                searchQuery,
                interaction.user
              );
              if (!musicTrack) {
                return interaction.editReply(
                  "❌ | Could not find a suitable music track. Please try a different search query."
                );
              }

              queue.addTrack(musicTrack);

              const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle("🎵 Added to Queue")
                .setDescription(`[${musicTrack.title}](${musicTrack.url})`)
                .addFields([
                  {
                    name: "Duration",
                    value: musicTrack.duration || "Unknown duration",
                    inline: true,
                  },
                  {
                    name: "Artist",
                    value: musicTrack.author || "Unknown artist",
                    inline: true,
                  },
                ])
                .setThumbnail(musicTrack.thumbnail || null)
                .setTimestamp();

              await interaction.editReply({ embeds: [embed] });
            }

            if (!queue.isPlaying()) {
              await queue.node.play();
            }
          } catch (error) {
            console.error("Error in play command:", error);
            return interaction.editReply({
              content: "❌ | An error occurred while processing your request!",
            });
          }
          break;
        }

        case "pause": {
          if (!queue.isPlaying()) {
            return interaction.reply("❌ | No music is currently playing!");
          }

          queue.node.pause();
          return interaction.reply("⏸️ | Music paused!");
        }

        case "resume": {
          if (!queue.node.isPaused()) {
            return interaction.reply("❌ | Music is not paused!");
          }

          queue.node.resume();
          return interaction.reply("▶️ | Music resumed!");
        }

        case "skip": {
          if (!queue.isPlaying()) {
            return interaction.reply("❌ | No music is currently playing!");
          }

          queue.node.skip();
          return interaction.reply("⏭️ | Skipped song!");
        }

        case "queue": {
          const page = interaction.options.getInteger("page") || 1;
          const queueTracks = queue.tracks.toArray();
          const currentTrack = queue.currentTrack;
          const totalPages = Math.ceil(queueTracks.length / 10);

          if (!queueTracks.length) {
            return interaction.reply("❌ | Queue is empty!");
          }

          if (page < 1 || page > totalPages) {
            return interaction.reply(
              `❌ | Invalid page number. The queue has ${totalPages} pages.`
            );
          }

          const embedDescription = [
            `**Now Playing:**\n${
              currentTrack
                ? `[${currentTrack.title}](${currentTrack.url}) - ${
                    currentTrack.duration || "Unknown duration"
                  }`
                : "None"
            }\n\n**Up Next:**`,
          ];

          const startIndex = (page - 1) * 10;
          const endIndex = startIndex + 10;
          const tracksToDisplay = queueTracks.slice(startIndex, endIndex);

          for (let i = 0; i < tracksToDisplay.length; i++) {
            const track = tracksToDisplay[i];
            embedDescription.push(
              `${startIndex + i + 1}. [${track.title}](${track.url}) - ${
                track.duration || "Unknown duration"
              }`
            );
          }

          const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🎵 Music Queue")
            .setDescription(embedDescription.join("\n"))
            .setFooter({
              text: `Page ${page} of ${totalPages}`,
            })
            .setTimestamp();

          return interaction.reply({ embeds: [embed] });
        }

        case "clear": {
          if (!queue.tracks.size) {
            return interaction.reply("❌ | Queue is already empty!");
          }

          queue.tracks.clear();
          return interaction.reply("🗑️ | Queue cleared!");
        }

        case "stop": {
          if (!queue.isPlaying()) {
            return interaction.reply("❌ | No music is currently playing!");
          }

          queue.delete();
          return interaction.reply("⏹️ | Stopped playing and cleared queue!");
        }

        case "volume": {
          const volume = interaction.options.getInteger("percentage", true);
          queue.node.setVolume(volume);
          return interaction.reply(`🔊 | Volume set to ${volume}%`);
        }

        case "nowplaying": {
          const currentTrack = queue.currentTrack;

          if (!currentTrack) {
            return interaction.reply("❌ | No music is currently playing!");
          }

          const progress = queue.node.createProgressBar();

          const embed = new EmbedBuilder()
            .setColor("#0099ff")
            .setTitle("🎵 Now Playing")
            .setDescription(`[${currentTrack.title}](${currentTrack.url})`)
            .addFields([
              {
                name: "Progress",
                value: progress || "Unknown progress",
                inline: false,
              },
              {
                name: "Duration",
                value: currentTrack.duration || "Unknown duration",
                inline: true,
              },
              {
                name: "Requested By",
                value: currentTrack.requestedBy?.tag || "Unknown",
                inline: true,
              },
            ])
            .setThumbnail(currentTrack.thumbnail || null)
            .setTimestamp();

          return interaction.reply({ embeds: [embed] });
        }

        case "shuffle": {
          if (!queue.tracks.size) {
            return interaction.reply(
              "❌ | Not enough songs in the queue to shuffle!"
            );
          }

          queue.tracks.shuffle();
          return interaction.reply("🔀 | Queue shuffled!");
        }

        case "loop": {
          const mode = interaction.options.getString("mode", true);

          switch (mode) {
            case "off":
              queue.setRepeatMode(0);
              return interaction.reply("🔁 | Loop mode: Off");
            case "track":
              queue.setRepeatMode(1);
              return interaction.reply("🔂 | Loop mode: Track");
            case "queue":
              queue.setRepeatMode(2);
              return interaction.reply("🔁 | Loop mode: Queue");
            default:
              return interaction.reply("❌ | Invalid loop mode!");
          }
        }
      }
    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "❌ | An error occurred while executing the command!",
        ephemeral: true,
      });
    }
  },
};

// Helper function to find a suitable music track
async function findMusicTrack(
  player: Player,
  query: string,
  requestedBy: User
): Promise<Track | null> {
  const searchResult: SearchResult = await player.search(query, {
    requestedBy,
    searchEngine: QueryType.YOUTUBE_SEARCH,
  });

  if (!searchResult || !searchResult.tracks.length) {
    return null;
  }

  const musicTrack = searchResult.tracks.find((track: Track) => {
    const title = track.title.toLowerCase();
    const isHighlight =
      title.includes("highlights") ||
      title.includes("gameplay") ||
      title.includes("full game");

    // Convert duration to seconds for comparison
    const durationParts = track.duration.split(":").map(Number);
    const durationInSeconds =
      durationParts.length === 2
        ? durationParts[0] * 60 + durationParts[1]
        : durationParts[0] * 3600 + durationParts[1] * 60 + durationParts[2];

    // Check if it's likely a music track (between 30 seconds and 10 minutes)
    const isReasonableLength =
      durationInSeconds >= 30 && durationInSeconds <= 600;

    return !isHighlight && isReasonableLength;
  });

  return musicTrack || null;
}

module.exports = command;
