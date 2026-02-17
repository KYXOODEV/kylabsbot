const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, staff } = require('../../utils/embeds');
const { canModerate, isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannit un membre du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à bannir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du bannissement')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('jours')
                .setDescription('Nombre de jours de messages à supprimer (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7)),

    async execute(interaction) {
        const target = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const deleteDays = interaction.options.getInteger('jours') || 0;
        const member = interaction.guild.members.cache.get(target.id);

        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        if (member && !canModerate(interaction.member, member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous ne pouvez pas bannir ce membre.')],
                ephemeral: true
            });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [error('Erreur', 'Je ne peux pas me bannir moi-même.')],
                ephemeral: true
            });
        }

        try {
            await interaction.guild.members.ban(target, {
                reason: `${reason} | Par ${interaction.user.tag}`,
                deleteMessageDays: deleteDays
            });

            const logChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'logs' && channel.type === 0
            );

            if (logChannel) {
                await logChannel.send({
                    embeds: [staff('Membre banni', `Un membre a été banni du serveur.`, [
                        { name: 'Membre', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Raison', value: reason, inline: false },
                        { name: 'Messages supprimés', value: `${deleteDays} jour(s)`, inline: true }
                    ])]
                });
            }

            logger.info(`Ban: ${target.tag} par ${interaction.user.tag} - Raison: ${reason}`);

            await interaction.reply({
                embeds: [success('Membre banni', `${target.tag} a été banni du serveur.\n**Raison:** ${reason}`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors du ban: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Impossible de bannir ce membre. Vérifiez mes permissions.')],
                ephemeral: true
            });
        }
    }
};
