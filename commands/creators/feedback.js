const { SlashCommandBuilder } = require('discord.js');
const { success, error, creator } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Demander un feedback sur votre vidéo')
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Lien vers votre vidéo')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Question spécifique ou point sur lequel vous voulez des retours')
                .setRequired(false)
                .setMaxLength(500))
        .addStringOption(option =>
            option.setName('plateforme')
                .setDescription('Plateforme de la vidéo')
                .setRequired(false)
                .addChoices(
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'Twitch', value: 'twitch' },
                    { name: 'TikTok', value: 'tiktok' },
                    { name: 'Instagram', value: 'instagram' },
                    { name: 'Autre', value: 'autre' }
                )),

    async execute(interaction) {
        const link = interaction.options.getString('lien');
        const question = interaction.options.getString('question') || 'Aucune question spécifique';
        const platform = interaction.options.getString('plateforme') || 'Non spécifiée';

        const platformNames = {
            youtube: 'YouTube',
            twitch: 'Twitch',
            tiktok: 'TikTok',
            instagram: 'Instagram',
            autre: 'Autre'
        };

        try {
            const feedbackChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'feedback-vidéos' && channel.type === 0
            );

            if (!feedbackChannel) {
                return interaction.reply({
                    embeds: [error('Erreur', 'Le salon feedback-vidéos n\'a pas été trouvé.')],
                    ephemeral: true
                });
            }

            const embed = creator('Demande de feedback', `Une nouvelle demande de feedback a été soumise.`, [
                { name: 'Créateur', value: `${interaction.user.tag}`, inline: true },
                { name: 'Plateforme', value: platformNames[platform] || platform, inline: true },
                { name: 'Lien', value: link, inline: false },
                { name: 'Question / Point spécifique', value: question, inline: false }
            ]);

            await feedbackChannel.send({
                content: `<@&${interaction.guild.roles.cache.find(r => r.name === 'Créateur KyLabsCrew')?.id || ''}>`,
                embeds: [embed]
            });

            logger.info(`Feedback demandé: ${interaction.user.tag} - Plateforme: ${platform}`);

            await interaction.reply({
                embeds: [success('Demande envoyée', 'Votre demande de feedback a été envoyée ! La communauté va vous aider.')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la demande de feedback: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de l\'envoi de votre demande.')],
                ephemeral: true
            });
        }
    }
};
