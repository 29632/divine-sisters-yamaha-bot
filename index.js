// Divine Sisters Yamaha Bot — Full Fixed Version
// -----------------------------------------------
require("dotenv").config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const noblox = require("noblox.js");
const express = require("express");

// ⚙️ Express Web Server (for Uptime)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Divine Sisters Yamaha Bot is running."));
app.listen(PORT, () => console.log(`🌐 Web server listening on ${PORT}`));

// ⚙️ Roblox Login
(async () => {
  try {
    const cookie = process.env.ROBLOX_COOKIE;
    if (!cookie) throw new Error("ROBLOX_COOKIE not found in .env");
    await noblox.setCookie(cookie);
    const currentUser = await noblox.getCurrentUser();
    console.log("✅ Logged in to Roblox as:", currentUser.UserName);
  } catch (err) {
    console.error("❌ Roblox login failed:", err.message);
  }
})();

// ⚙️ Discord Client Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
  ],
});

client.commands = new Collection();

// ⚙️ Command: /rank
const { SlashCommandBuilder } = require("discord.js");

const rankCommand = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Assign a Roblox group rank to a player")
    .addStringOption(option =>
      option.setName("username")
        .setDescription("Roblox username")
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName("roleid")
        .setDescription("Roblox group role ID")
        .setRequired(true)),
  async execute(interaction) {
    // Temporary: Allow Admins
    const allowedRoleId = '1396501423692447865'; // Replace if you want to restrict
    const member = interaction.member;

    // Optional check — skip if not needed
    if (allowedRoleId !== '1396501423692447865' && !member.roles.cache.has(allowedRoleId)) {
      return interaction.reply({
        content: "❌ You do not have permission to use this command.",
        ephemeral: true
      });
    }

    const username = interaction.options.getString("username");
    const roleId = interaction.options.getInteger("roleid");

    await interaction.deferReply();

    try {
      const userId = await noblox.getIdFromUsername(username);
      await noblox.setRank(process.env.GROUP_ID, userId, roleId);
      await interaction.editReply(`✅ Successfully ranked **${username}** to role ID **${roleId}**!`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ Failed to rank ${username}. Error: ${error.message}`);
    }
  },
};

client.commands.set(rankCommand.data.name, rankCommand);

// ⚙️ Register Slash Command
(async () => {
  try {
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: [rankCommand.data.toJSON()] }
    );
    console.log(`✅ Registered /rank command to guild ${process.env.GUILD_ID}`);
  } catch (error) {
    console.error("❌ Failed to register command:", error);
  }
})();

// ⚙️ On Interaction
client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "❌ An error occurred while executing this command.",
      ephemeral: true,
    });
  }
});

// ⚙️ Bot Login
client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
