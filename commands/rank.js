import { SlashCommandBuilder } from 'discord.js';
import noblox from 'noblox.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Assign a Roblox group rank to a player')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Roblox username')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('roleid')
        .setDescription('Roblox group role ID')
        .setRequired(true)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // ✅ Temporary admin bypass (for owners or admins)
      const isAdmin = interaction.member.permissions.has('Administrator');
      const allowedRoleId = '1396501423692447865';
      const hasRole = interaction.member.roles.cache.has(allowedRoleId);

      if (!isAdmin && !hasRole) {
        return interaction.editReply('❌ You do not have permission to use this command.');
      }

      await noblox.setCookie(process.env.ROBLOX_COOKIE);
      const username = interaction.options.getString('username');
      const roleId = interaction.options.getInteger('roleid');
      const userId = await noblox.getIdFromUsername(username);

      await noblox.setRank(process.env.GROUP_ID, userId, roleId);
      await interaction.editReply(`✅ Successfully ranked **${username}** to role ID **${roleId}**.`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ Failed to rank player: ${error.message}`);
    }
  }
};
