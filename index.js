import { Client, GatewayIntentBits, Collection } from 'discord.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load all commands
const commandsPath = path.resolve('./commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  client.commands.set(command.default.data.name, command.default);
}

// Slash command handling
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Keep bot alive (for hosting)
const app = express();
app.get('/', (req, res) => res.send('Yamaha Bot is running!'));
app.listen(process.env.PORT || 3000, () => console.log('🌐 Web server running.'));

client.login(process.env.TOKEN);
