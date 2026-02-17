const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, staff } = require('../../utils/embeds');
const { canModerate, isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulse un membre du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à expulser')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'expulsion')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison') || 'Aucune raison spécifiée';
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);

        if (!member) {
            return interaction.reply({
                embeds: [error('Erreur', 'Ce membre n\'est pas sur le serveur.')],
                ephemeral: true
            });
        }

        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        if (!canModerate(interaction.member, member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous ne pouvez pas expulser ce membre.')],
                ephemeral: true
            });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [error('Erreur', 'Je ne peux pas m\'expulser moi-même.')],
                ephemeral: true
            });
        }

        try {
            await member.kick(`${reason} | Par ${interaction.user.tag}`);

            const logChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'logs' && channel.type === 0
            );

            if (logChannel) {
                await logChannel.send({
                    embeds: [staff('Membre expulsé', `Un membre a été expulsé du serveur.`, [
                        { name: 'Membre', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Raison', value: reason, inline: false }
                    ])]
                });
            }

            logger.info(`Kick: ${target.tag} par ${interaction.user.tag} - Raison: ${reason}`);

            await interaction.reply({
                embeds: [success('Membre expulsé', `${target.tag} a été expulsé du serveur.\n**Raison:** ${reason}`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors du kick: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Impossible d\'expulser ce membre. Vérifiez mes permissions.')],
                ephemeral: true
            });
        }
    }
};
