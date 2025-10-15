// index.js (CommonJS)
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

// Load commands from /commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    client.commands.set(cmd.data.name, cmd);
  }
}

client.once('ready', () => {
  console.log(`✅ Bot ready — logged in as ${client.user.tag} (${client.user.id})`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  console.log(`--- Interaction: /${interaction.commandName} by ${interaction.user.tag}`);
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    return interaction.reply({ content: 'Command not found.', ephemeral: true });
  }
  try {
    await command.execute(interaction);
  } catch (err) {
    console.error('Command error:', err);
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: 'There was an error running that command.' });
      } else {
        await interaction.reply({ content: 'There was an error running that command.', ephemeral: true });
      }
    } catch (e) {
      console.error('Failed to reply after error:', e);
    }
  }
});

// small webserver for hosting platforms (Railway)
const app = express();
app.get('/', (req, res) => res.send('Bot is alive'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Web server listening on ${port}`));

// Login
if (!process.env.DISCORD_TOKEN) {
  console.error('ERROR: DISCORD_TOKEN env variable missing');
  process.exit(1);
}
client.login(process.env.DISCORD_TOKEN).catch(err => {
  console.error('Discord login failed:', err);
  process.exit(1);
});
