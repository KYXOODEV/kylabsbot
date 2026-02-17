const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, staff } = require('../../utils/embeds');
const { canModerate, isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Avertit un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à avertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison de l\'avertissement')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('membre');
        const reason = interaction.options.getString('raison');
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
                embeds: [error('Permission refusée', 'Vous ne pouvez pas avertir ce membre.')],
                ephemeral: true
            });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [error('Erreur', 'Je ne peux pas m\'avertir moi-même.')],
                ephemeral: true
            });
        }

        try {
            const logChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'logs' && channel.type === 0
            );

            if (logChannel) {
                await logChannel.send({
                    embeds: [staff('Membre averti', `Un membre a reçu un avertissement.`, [
                        { name: 'Membre', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Raison', value: reason, inline: false }
                    ])]
                });
            }

            try {
                await member.send({
                    embeds: [staff('Avertissement', `Vous avez reçu un avertissement sur **${interaction.guild.name}**.`, [
                        { name: 'Raison', value: reason, inline: false },
                        { name: 'Modérateur', value: interaction.user.tag, inline: true }
                    ])]
                });
            } catch (err) {
                // Les DMs peuvent être désactivés, on continue quand même
            }

            logger.info(`Warn: ${target.tag} par ${interaction.user.tag} - Raison: ${reason}`);

            await interaction.reply({
                embeds: [success('Membre averti', `${target.tag} a reçu un avertissement.\n**Raison:** ${reason}`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors du warn: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de l\'avertissement.')],
                ephemeral: true
            });
        }
    }
};
