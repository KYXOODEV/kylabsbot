const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, staff } = require('../../utils/embeds');
const { canModerate, isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Rend muet un membre')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('membre')
                .setDescription('Le membre à rendre muet')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duree')
                .setDescription('Durée du mute en minutes')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(40320))
        .addStringOption(option =>
            option.setName('raison')
                .setDescription('La raison du mute')
                .setRequired(false)),

    async execute(interaction) {
        const target = interaction.options.getUser('membre');
        const duration = interaction.options.getInteger('duree');
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
                embeds: [error('Permission refusée', 'Vous ne pouvez pas rendre muet ce membre.')],
                ephemeral: true
            });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({
                embeds: [error('Erreur', 'Je ne peux pas me rendre muet moi-même.')],
                ephemeral: true
            });
        }

        try {
            const durationMs = duration * 60 * 1000;
            await member.timeout(durationMs, `${reason} | Par ${interaction.user.tag}`);

            const logChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'logs' && channel.type === 0
            );

            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

            if (logChannel) {
                await logChannel.send({
                    embeds: [staff('Membre rendu muet', `Un membre a été rendu muet.`, [
                        { name: 'Membre', value: `${target.tag} (${target.id})`, inline: true },
                        { name: 'Modérateur', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Durée', value: durationText, inline: true },
                        { name: 'Raison', value: reason, inline: false }
                    ])]
                });
            }

            logger.info(`Mute: ${target.tag} par ${interaction.user.tag} - Durée: ${durationText} - Raison: ${reason}`);

            await interaction.reply({
                embeds: [success('Membre rendu muet', `${target.tag} a été rendu muet pendant **${durationText}**.\n**Raison:** ${reason}`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors du mute: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Impossible de rendre muet ce membre. Vérifiez mes permissions.')],
                ephemeral: true
            });
        }
    }
};
