const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, community } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Créer un événement communautaire')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents)
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Titre de l\'événement')
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Description de l\'événement')
                .setRequired(true)
                .setMaxLength(1000))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date et heure de l\'événement (format: JJ/MM/AAAA HH:MM)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('salon')
                .setDescription('Salon où annoncer l\'événement')
                .setRequired(false)),

    async execute(interaction) {
        const title = interaction.options.getString('titre');
        const description = interaction.options.getString('description');
        const dateStr = interaction.options.getString('date');
        const channel = interaction.options.getChannel('salon') || interaction.channel;

        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour créer un événement.')],
                ephemeral: true
            });
        }

        try {
            // Parser la date (format: JJ/MM/AAAA HH:MM)
            const dateMatch = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})/);
            if (!dateMatch) {
                return interaction.reply({
                    embeds: [error('Format invalide', 'Utilisez le format: JJ/MM/AAAA HH:MM (ex: 25/12/2024 20:00)')],
                    ephemeral: true
                });
            }

            const [, day, month, year, hour, minute] = dateMatch;
            const eventDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);

            if (isNaN(eventDate.getTime()) || eventDate < new Date()) {
                return interaction.reply({
                    embeds: [error('Date invalide', 'La date doit être dans le futur.')],
                    ephemeral: true
                });
            }

            const embed = community('Événement communautaire', description, [
                { name: '📅 Date', value: `<t:${Math.floor(eventDate.getTime() / 1000)}:F>`, inline: true },
                { name: '⏰ Dans', value: `<t:${Math.floor(eventDate.getTime() / 1000)}:R>`, inline: true },
                { name: '👤 Organisateur', value: interaction.user.tag, inline: true }
            ])
                .setTitle(`🎉 ${title}`);

            await channel.send({
                content: '@everyone',
                embeds: [embed]
            });

            logger.info(`Événement créé: ${title} par ${interaction.user.tag} - Date: ${dateStr}`);

            await interaction.reply({
                embeds: [success('Événement créé', `L'événement "${title}" a été annoncé dans ${channel}.`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la création de l'événement: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la création de l\'événement.')],
                ephemeral: true
            });
        }
    }
};
