// commands/rank.js (CommonJS)
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Assign a Roblox group rank to a player')
    .addStringOption(opt => opt.setName('username').setDescription('Roblox username').setRequired(true))
    .addIntegerOption(opt => opt.setName('roleid').setDescription('Roblox group role ID').setRequired(true)),

  async execute(interaction) {
    // immediate feedback
    console.log(`/rank invoked by ${interaction.user.tag} (${interaction.user.id})`);

    // ADMIN fallback for testing: allow server admins
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      // role-based check next
      const allowedRoleId = process.env.ALLOWED_ROLE_ID || '1396501423692447865'; // update via env if needed
      let hasRole = false;
      try {
        if (interaction.member && interaction.member.roles) {
          if (interaction.member.roles.cache) {
            hasRole = interaction.member.roles.cache.has(allowedRoleId);
          } else if (Array.isArray(interaction.member.roles)) {
            hasRole = interaction.member.roles.includes(allowedRoleId);
          }
        }
      } catch (e) {
        console.error('Role check error:', e);
      }

      if (!hasRole) {
        console.log('Permission denied : user lacks role and is not admin');
        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      }
    }

    const username = interaction.options.getString('username');
    const roleId = interaction.options.getInteger('roleid');

    await interaction.deferReply();

    try {
      console.log('Logging into Roblox with cookie...');
      await noblox.setCookie(process.env.ROBLOX_COOKIE);
      console.log('Looking up Roblox user:', username);
      const userId = await noblox.getIdFromUsername(username);
      console.log('Got userId', userId, '— setting rank to', roleId);
      await noblox.setRank(process.env.GROUP_ID, userId, roleId);
      console.log('Rank set successful.');
      await interaction.editReply(`✅ Successfully ranked **${username}** to role ID **${roleId}**.`);
    } catch (err) {
      console.error('Ranking error:', err);
      await interaction.editReply(`❌ Failed to rank **${username}**.\nError: \`${err.message}\``);
    }
  }
};
