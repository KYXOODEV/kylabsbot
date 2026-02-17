const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, creator, info } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Postuler pour devenir créateur KyLabsCrew')
        .addStringOption(option =>
            option.setName('plateforme')
                .setDescription('Votre plateforme principale')
                .setRequired(true)
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'Twitch', value: 'twitch' },
                    { name: 'TikTok', value: 'tiktok' },
                    { name: 'Instagram', value: 'instagram' },
                    { name: 'Autre', value: 'autre' }
                ))
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Lien vers votre chaîne/compte')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Décrivez-vous et votre contenu')
                .setRequired(true)
                .setMaxLength(1000))
        .addIntegerOption(option =>
            option.setName('abonnes')
                .setDescription('Nombre d\'abonnés/abonnés approximatif')
                .setRequired(false)
                .setMinValue(0)),

    async execute(interaction) {
        const platform = interaction.options.getString('plateforme');
        const link = interaction.options.getString('lien');
        const description = interaction.options.getString('description');
        const subscribers = interaction.options.getInteger('abonnes') || 0;

        const platformNames = {
            youtube: 'YouTube',
            twitch: 'Twitch',
            tiktok: 'TikTok',
            instagram: 'Instagram',
            autre: 'Autre'
        };

        try {
            const applicationChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'idées-contenu' && channel.type === 0
            );

            if (!applicationChannel) {
                return interaction.reply({
                    embeds: [error('Erreur', 'Le salon de candidatures n\'a pas été trouvé.')],
                    ephemeral: true
                });
            }

            const embed = creator('Nouvelle candidature créateur', `Une nouvelle candidature a été soumise.`, [
                { name: 'Candidat', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                { name: 'Plateforme', value: platformNames[platform], inline: true },
                { name: 'Abonnés', value: subscribers > 0 ? subscribers.toLocaleString() : 'Non spécifié', inline: true },
                { name: 'Lien', value: link, inline: false },
                { name: 'Description', value: description, inline: false }
            ]);

            await applicationChannel.send({
                content: `<@&${interaction.guild.roles.cache.find(r => r.name === 'Créateur KyLabsCrew')?.id || ''}>`,
                embeds: [embed]
            });

            logger.info(`Candidature créateur: ${interaction.user.tag} - Plateforme: ${platformNames[platform]}`);

            await interaction.reply({
                embeds: [success('Candidature envoyée', 'Votre candidature a été envoyée avec succès ! L\'équipe va l\'examiner sous peu.')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la candidature: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de l\'envoi de votre candidature.')],
                ephemeral: true
            });
        }
    }
};
