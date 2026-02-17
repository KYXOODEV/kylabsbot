const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { info } = require('../../utils/embeds');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Affiche les informations sur le serveur'),

    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`ℹ️ Informations - ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setDescription(guild.description || 'Serveur KyLabsCrew')
            .addFields(
                { name: '👑 Propriétaire', value: owner.user.tag, inline: true },
                { name: '👥 Membres', value: `${guild.memberCount}`, inline: true },
                { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
                { name: '📂 Salons', value: `${guild.channels.cache.size}`, inline: true },
                { name: '🎭 Rôles', value: `${guild.roles.cache.size}`, inline: true },
                { name: '🤖 Bots', value: `${guild.members.cache.filter(m => m.user.bot).size}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `ID: ${guild.id}` });

        if (guild.bannerURL()) {
            embed.setImage(guild.bannerURL({ dynamic: true }));
        }

        await interaction.reply({ embeds: [embed] });
    }
};
