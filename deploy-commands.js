// deploy-commands.js (CommonJS)
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
  console.error('ERROR: DISCORD_TOKEN, CLIENT_ID and GUILD_ID must be set in environment.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.existsSync(commandsPath) ? fs.readdirSync(commandsPath).filter(f => f.endsWith('.js')) : [];

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🚀 Registering ${commands.length} command(s) to guild ${process.env.GUILD_ID}`);
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });
    console.log('✅ Commands registered.');
  } catch (err) {
    console.error('Failed to register commands:', err);
  }
})();
