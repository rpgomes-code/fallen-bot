# Fallen Bot - Discord Bot

Fallen Bot is a feature-rich Discord bot built with Discord.js and TypeScript. It provides a wide range of commands for moderation, music playback, server management, and fun interactions.

## Table of Contents

- [Fallen Bot - Discord Bot](#fallen-bot---discord-bot)
  - [Table of Contents](#table-of-contents)
  - [Features Overview](#features-overview)
  - [Technical Architecture](#technical-architecture)
  - [Command Categories](#command-categories)
    - [Moderation Commands](#moderation-commands)
      - [`/mod kick`](#mod-kick)
      - [`/mod ban`](#mod-ban)
      - [`/mod unban`](#mod-unban)
      - [`/mod timeout`](#mod-timeout)
      - [`/mod remove_timeout`](#mod-remove_timeout)
      - [`/mod warn`](#mod-warn)
      - [`/mod warnings`](#mod-warnings)
    - [Welcome System](#welcome-system)
      - [`/welcome enable`](#welcome-enable)
      - [`/welcome disable`](#welcome-disable)
      - [`/welcome message`](#welcome-message)
      - [`/welcome appearance`](#welcome-appearance)
      - [`/welcome rules`](#welcome-rules)
      - [`/welcome mention`](#welcome-mention)
      - [`/welcome preview`](#welcome-preview)
      - [`/welcome status`](#welcome-status)
      - [`/testwelcome`](#testwelcome)
    - [Music Commands](#music-commands)
      - [`/music play`](#music-play)
      - [`/music queue`](#music-queue)
      - [`/music controls`](#music-controls)
      - [`/music volume`](#music-volume)
      - [`/music seek`](#music-seek)
      - [`/music loop`](#music-loop)
      - [`/music nowplaying`](#music-nowplaying)
      - [`/music shuffle`](#music-shuffle)
      - [`/music clear`](#music-clear)
    - [Utility Commands](#utility-commands)
      - [`/help`](#help)
      - [`/ping`](#ping)
      - [`/user`](#user)
      - [`/server`](#server)
      - [`/role`](#role)
      - [`/avatar`](#avatar)
      - [`/servericon`](#servericon)
    - [Fun Commands](#fun-commands)
      - [`/coinflip`](#coinflip)
      - [`/dice`](#dice)
      - [`/8ball`](#8ball)
      - [`/rps`](#rps)
      - [`/poll`](#poll)
      - [`/howgay`](#howgay)
  - [Installation and Setup](#installation-and-setup)
  - [Configuration](#configuration)
  - [Deployment](#deployment)
  - [Future Enhancements](#future-enhancements)

## Features Overview

Fallen Bot offers a comprehensive set of features designed to enhance Discord server management and user experience:

- **Robust Moderation System**: Ban, kick, timeout, and warning management with permission hierarchy enforcement and action logging.
- **Advanced Music Player**: High-quality audio playback with playlist support, queue management, and various playback controls.
- **Interactive Commands**: Fun commands that generate rich embed responses and interactive elements.
- **Role Management**: Sophisticated role assignment system with permission validation.
- **Server Information**: Commands to display user, server, and asset information.
- **Welcome System**: Customizable welcome messages with rich embeds when new members join the server.

## Technical Architecture

The bot is built with a modular architecture using TypeScript and Discord.js v14. Key technical features include:

- **TypeScript Integration**: Type-safe code with interfaces for commands, events, and configurations.
- **Command Handler System**: Dynamic command loading and execution with subcommand support.
- **Event-Based Architecture**: Event-driven design following Discord.js patterns.
- **Error Handling**: Comprehensive error catching and user-friendly error messages.
- **Permission Management**: Built-in permission validation for commands.

## Command Categories

### Moderation Commands

The moderation suite provides comprehensive tools for server administrators and moderators.

#### `/mod kick`

Removes a user from the server (they can rejoin with an invite).

- **Options**:
  - `target`: The user to kick (required)
  - `reason`: Reason for the kick (optional)
- **Permissions Required**: `KICK_MEMBERS`
- **Features**:
  - Validates moderator has higher role than target
  - Creates detailed logs
  - Returns confirmation with user information

#### `/mod ban`

Permanently removes a user from the server.

- **Options**:
  - `target`: The user to ban (required)
  - `reason`: Reason for the ban (optional)
  - `delete_messages`: How much message history to delete (optional, in days)
- **Permissions Required**: `BAN_MEMBERS`
- **Features**:
  - Can ban users who aren't in the server
  - Message deletion options (none, 24h, 3d, 7d)
  - Detailed logging and confirmation

#### `/mod unban`

Removes a ban on a user, allowing them to rejoin with an invite.

- **Options**:
  - `user_id`: ID of the banned user (required)
  - `reason`: Reason for the unban (optional)
- **Permissions Required**: `BAN_MEMBERS`
- **Features**:
  - Validates the ID is for a currently banned user
  - Logs the unban action
  - Returns confirmation with user information

#### `/mod timeout`

Temporarily restricts a user from sending messages or joining voice channels.

- **Options**:
  - `target`: The user to timeout (required)
  - `duration`: Timeout duration (required, formats like "1h", "30m", "1d")
  - `reason`: Reason for the timeout (optional)
- **Permissions Required**: `MODERATE_MEMBERS`
- **Features**:
  - Flexible duration parsing (seconds, minutes, hours, days, weeks)
  - Maximum duration enforcement (28 days)
  - Detailed logging and confirmation

#### `/mod remove_timeout`

Removes an active timeout from a user.

- **Options**:
  - `target`: The user to remove timeout from (required)
  - `reason`: Reason for removing the timeout (optional)
- **Permissions Required**: `MODERATE_MEMBERS`
- **Features**:
  - Verifies user actually has an active timeout
  - Logs the removal action
  - Returns confirmation with user information

#### `/mod warn`

Issues a warning to a user that is recorded in the warning system.

- **Options**:
  - `target`: The user to warn (required)
  - `reason`: Reason for the warning (required)
- **Permissions Required**: `MODERATE_MEMBERS`
- **Features**:
  - In-memory warning storage system
  - Attempts to notify user via DM
  - Generates unique IDs for each warning
  - Tracks warning count per user

#### `/mod warnings`

Shows the warning history for a specified user.

- **Options**:
  - `target`: The user to check warnings for (required)
- **Permissions Required**: `MODERATE_MEMBERS`
- **Features**:
  - Lists all warnings with IDs, timestamps, reasons, and moderator information
  - Chronological ordering (newest first)
  - User-friendly embed display

### Welcome System

The welcome system provides customizable welcome messages for new members joining your server.

#### `/welcome enable`

Enables the welcome system and sets the welcome channel.

- **Options**:
  - `channel`: The text channel to send welcome messages to (required)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Activates welcome messages for new members
  - Sets up default welcome message if not previously configured
  - Validates that the selected channel is a text channel

#### `/welcome disable`

Disables the welcome system.

- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Turns off welcome messages while preserving your settings

#### `/welcome message`

Sets the welcome message text.

- **Options**:
  - `text`: Welcome message text (required)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Supports variables: `{user}`, `{username}`, `{tag}`, `{server}`, `{memberCount}`
  - Customizable message content

#### `/welcome appearance`

Customizes the welcome embed appearance.

- **Options**:
  - `title`: Embed title (optional)
  - `color`: Embed color as hex code (optional)
  - `footer`: Footer text (optional)
  - `image`: URL of an image to include in the embed (optional)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Color validation for proper hex format
  - Custom image support
  - Personalized title and footer text

#### `/welcome rules`

Configures rules information in welcome messages.

- **Options**:
  - `show`: Whether to show rules info in welcome messages (required)
  - `channel`: Rules channel to reference (required if show is true)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Adds a convenient link to your rules channel
  - Can be toggled on/off as needed

#### `/welcome mention`

Configures whether to mention new users in welcome messages.

- **Options**:
  - `enabled`: Whether to mention new users (required)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Allows controlling whether users get pinged with welcome message

#### `/welcome preview`

Previews the welcome message.

- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Shows exactly how the welcome message will appear
  - Uses your current settings
  - Marks the preview so it's not confused with a real welcome

#### `/welcome status`

Checks welcome system status and configuration.

- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Comprehensive overview of all welcome settings
  - Shows enabled/disabled status
  - Displays all configuration options in one view

#### `/testwelcome`

Tests the welcome system by simulating a member join.

- **Options**:
  - `target`: User to simulate joining (optional, defaults to command user)
- **Permissions Required**: `MANAGE_GUILD`
- **Features**:
  - Sends a real welcome message to the configured channel
  - Helps verify welcome message appearance
  - Can test with different users in your server

### Music Commands

The music system allows for high-quality audio playback from YouTube/YouTube Music with extensive controls.

#### `/music play`

Plays a song or playlist from YouTube/YouTube Music.

- **Options**:
  - `query`: Song name or URL (required)
- **Features**:
  - Auto-joins voice channel
  - Supports direct URLs and search terms
  - Playlist support with automatic loading
  - High-quality audio playback

#### `/music queue`

Shows the current song queue with pagination.

- **Options**:
  - `page`: Queue page number (optional)
- **Features**:
  - Paginated display for large queues
  - Shows current track progress
  - Displays queue statistics and duration

#### `/music controls`

Basic playback control commands.

- **Subcommands**:
  - `pause`: Pauses the current track
  - `resume`: Resumes playback
  - `skip`: Skips to the next track
  - `stop`: Stops playback and clears the queue
- **Features**:
  - Detailed embeds showing the affected track
  - State validation (e.g., can't pause when already paused)

#### `/music volume`

Adjusts playback volume.

- **Options**:
  - `percentage`: Volume level 1-100 (required)
- **Features**:
  - Real-time volume adjustment
  - Shows volume change information

#### `/music seek`

Jumps to a specific position in the current track.

- **Options**:
  - `timestamp`: Time to seek to (required, formats like "1:30" or "90")
- **Features**:
  - Multiple timestamp format support
  - Validation against track duration
  - Shows new position information

#### `/music loop`

Sets the loop mode for playback.

- **Options**:
  - `mode`: Loop mode (required, choices: off/track/queue)
- **Features**:
  - Track loop: Repeats the current song
  - Queue loop: Repeats the entire queue
  - Detailed status display

#### `/music nowplaying`

Shows information about the currently playing track.

- **Features**:
  - Visual progress bar
  - Track metadata (duration, requester, etc.)
  - Thumbnail and URL

#### `/music shuffle`

Randomizes the order of tracks in the queue.

- **Features**:
  - Preserves the currently playing track
  - Shows preview of upcoming tracks after shuffle

#### `/music clear`

Removes all tracks from the queue except the currently playing track.

- **Features**:
  - Queue size validation
  - Confirmation message with count of removed tracks

### Utility Commands

#### `/help`

Shows available commands and usage information.

- **Options**:
  - `category`: Command category to show details for (optional)
- **Features**:
  - Categorized command listing
  - Detailed usage examples
  - Command syntax explanation

#### `/ping`

Checks the bot's latency.

- **Features**:
  - Displays message latency
  - Shows API latency
  - Real-time calculation

#### `/user`

Displays information about a user.

- **Options**:
  - `target`: User to get info about (optional, defaults to command user)
- **Features**:
  - Shows account creation date
  - Displays server join date
  - Lists roles and other user information

#### `/server`

Shows information about the current server.

- **Features**:
  - Member count statistics
  - Server creation date
  - Boost level and count
  - Server owner information

#### `/role`

Adds or removes roles from users.

- **Subcommands**:
  - `add`: Adds a role to a user
  - `remove`: Removes a role from a user
- **Options**:
  - `target`: User to modify roles for (required)
  - `role`: Role to add/remove (required)
- **Permissions Required**: `MANAGE_ROLES`
- **Features**:
  - Role hierarchy enforcement
  - Permission validation
  - Confirmation messages

#### `/avatar`

Shows a user's avatar in high resolution.

- **Options**:
  - `target`: User to show avatar for (optional, defaults to command user)
- **Features**:
  - High-resolution image display
  - Direct link to avatar image

#### `/servericon`

Displays the server's icon in high resolution.

- **Features**:
  - High-resolution image display
  - Validation for servers without icons

### Fun Commands

#### `/coinflip`

Flips a virtual coin.

- **Options**:
  - `times`: Number of coins to flip (optional, default 1)
- **Features**:
  - Multiple coin flips support (up to 100)
  - Statistical breakdown for multiple flips
  - Visually appealing embed

#### `/dice`

Rolls virtual dice.

- **Options**:
  - `sides`: Number of sides on the dice (optional, default 6)
  - `count`: Number of dice to roll (optional, default 1)
  - `sum`: Whether to show the sum of all dice (optional)
- **Features**:
  - Support for various dice types (d6, d20, etc.)
  - Multiple dice rolls
  - Statistical information for multiple rolls
  - Critical success/fail notifications

#### `/8ball`

Simulates a Magic 8-Ball with random responses to questions.

- **Options**:
  - `question`: Question to ask (required)
- **Features**:
  - 20 different possible responses
  - Color-coded responses (positive, neutral, negative)
  - Visually appealing embed

#### `/rps`

Play Rock, Paper, Scissors with the bot.

- **Options**:
  - `choice`: Your selection (rock, paper, or scissors) (required)
- **Features**:
  - Fair random selection by the bot
  - Win/loss/tie tracking
  - Visual representation of choices

#### `/poll`

Creates a poll for server members to vote on.

- **Options**:
  - `question`: The poll question (required)
  - `options`: Poll options separated by commas (required)
  - `duration`: How long the poll should last in minutes (optional)
- **Features**:
  - Automatic reaction addition for voting
  - Timed results calculation
  - Support for up to 10 options
  - Results display after completion

#### `/howgay`

A humor command that generates a random "gay percentage" for a user.

- **Options**:
  - `target`: User to evaluate (optional, defaults to command user)
- **Features**:
  - Random percentage generation
  - Visual progress bar
  - Rarity levels with different colors
  - Purely for entertainment purposes

## Installation and Setup

To set up the bot on your local machine:

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd fallen-bot
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Create configuration files**:
   Create a `.env` file in the root directory with the following variables:

   ```
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   GUILD_ID=your_development_guild_id
   ```

4. **Build the TypeScript code**:

   ```bash
   npm run build
   ```

5. **Deploy the commands** (for development):

   ```bash
   npm run deploy
   ```

6. **Start the bot**:
   ```bash
   npm start
   ```

## Configuration

The bot uses environment variables for configuration. Required variables:

- `TOKEN`: Your Discord bot token from the Discord Developer Portal
- `CLIENT_ID`: Your bot's client ID
- `GUILD_ID`: The ID of your development server

You can verify your environment setup with:

```bash
npm run verify-env
```

## Deployment

For production deployment:

1. **Build the project**:

   ```bash
   npm run build
   ```

2. **Set up production environment variables**

3. **Start the bot**:
   ```bash
   npm start
   ```

For continuous operation, consider using a process manager like PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name fallen-bot
```

## Future Enhancements

Planned features for future development:

- **Database Integration**: Replace in-memory storage with a persistent database
- **Web Dashboard**: Admin interface for bot configuration
- **Custom Prefix**: Allow servers to set custom command prefixes
- **Auto-moderation**: Content filtering and automated moderation actions
- **Leveling System**: User experience points and levels
- **Reaction Roles**: Role assignment via reactions
- **Scheduled Events**: Recurring announcements and events
- **Localization**: Support for multiple languages
