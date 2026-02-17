const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error, community } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Créer un sondage')
        .addStringOption(option =>
            option.setName('question')
                .setDescription('Question du sondage')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(option =>
            option.setName('option1')
                .setDescription('Première option')
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('option2')
                .setDescription('Deuxième option')
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('option3')
                .setDescription('Troisième option (optionnel)')
                .setRequired(false)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('option4')
                .setDescription('Quatrième option (optionnel)')
                .setRequired(false)
                .setMaxLength(100))
        .addIntegerOption(option =>
            option.setName('duree')
                .setDescription('Durée du sondage en heures (défaut: 24h)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(168)),

    async execute(interaction) {
        const question = interaction.options.getString('question');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');
        const option3 = interaction.options.getString('option3');
        const option4 = interaction.options.getString('option4');
        const duration = interaction.options.getInteger('duree') || 24;

        const options = [option1, option2];
        if (option3) options.push(option3);
        if (option4) options.push(option4);

        const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣'];

        try {
            const embed = community('Sondage communautaire', question, [
                { name: '⏰ Durée', value: `${duration} heure(s)`, inline: true },
                { name: '👤 Créé par', value: interaction.user.tag, inline: true }
            ]);

            let optionsText = '';
            options.forEach((opt, index) => {
                optionsText += `${emojis[index]} ${opt}\n`;
            });
            embed.addFields({ name: 'Options', value: optionsText, inline: false });

            const message = await interaction.reply({
                embeds: [embed],
                fetchReply: true
            });

            // Ajouter les réactions
            for (let i = 0; i < options.length; i++) {
                await message.react(emojis[i]);
            }

            logger.info(`Sondage créé: ${question} par ${interaction.user.tag} - Durée: ${duration}h`);

            // Supprimer automatiquement après la durée spécifiée (optionnel, nécessite un système de gestion)
            // Pour l'instant, on laisse le sondage actif indéfiniment
        } catch (err) {
            logger.error(`Erreur lors de la création du sondage: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la création du sondage.')],
                ephemeral: true
            });
        }
    }
};
