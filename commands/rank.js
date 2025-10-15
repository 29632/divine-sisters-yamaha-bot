const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
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
        // Check if the Discord user has the allowed role
        const allowedRoleId = '1400121797139103805';
        const member = interaction.member; // guild member who invoked the command

        if (!member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({ 
                content: "❌ You do not have permission to use this command.", 
                ephemeral: true 
            });
        }

        const username = interaction.options.getString('username');
        const roleId = interaction.options.getInteger('roleid');

        await interaction.deferReply();

        try {
            // Login to Roblox
            await noblox.setCookie(process.env.ROBLOX_COOKIE);

            // Get user ID from username
            const userId = await noblox.getIdFromUsername(username);

            // Set rank
            await noblox.setRank(process.env.GROUP_ID, userId, roleId);

            await interaction.editReply(`✅ Successfully ranked **${username}** to role ID **${roleId}**!`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`❌ Failed to rank ${username}. Error: ${error.message}`);
        }
    },
};
 