const { SlashCommandBuilder } = require('discord.js');
const noblox = require('noblox.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Ranks a Roblox player in the group')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Enter the Roblox username')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('roleid')
                .setDescription('Enter the Roblox group role ID')
                .setRequired(true)),

    async execute(interaction) {
        // ✅ Only allow users with this specific Discord role ID
        const allowedRoleId = '1396501423692447865';
        const member = interaction.member;

        if (!member.roles.cache.has(allowedRoleId)) {
            return interaction.reply({
                content: "❌ | You do not have permission to use this command.",
                ephemeral: true
            });
        }

        const username = interaction.options.getString('username');
        const roleId = interaction.options.getInteger('roleid');

        await interaction.deferReply({ ephemeral: false });

        try {
            // ✅ Log into Roblox using your cookie
            await noblox.setCookie(process.env.ROBLOX_COOKIE);

            // ✅ Get Roblox user ID
            const userId = await noblox.getIdFromUsername(username);

            // ✅ Rank the player
            await noblox.setRank(process.env.GROUP_ID, userId, roleId);

            await interaction.editReply(`✅ | Successfully ranked **${username}** to role ID **${roleId}**.`);
        } catch (error) {
            console.error(error);
            await interaction.editReply(`❌ | Failed to rank **${username}**.\nError: \`${error.message}\``);
        }
    },
};
