const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { error } = require('../../utils/embeds');
const { isAdmin } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Affiche les logs des actions du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('Nombre de logs à afficher (défaut: 50, max: 100)')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(100))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Filtrer par type de log')
                .setRequired(false)
                .addChoices(
                    { name: 'Info', value: 'info' },
                    { name: 'Success', value: 'success' },
                    { name: 'Warning', value: 'warn' },
                    { name: 'Error', value: 'error' },
                    { name: 'Debug', value: 'debug' }
                )),

    async execute(interaction) {
        if (!isAdmin(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être administrateur pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const limit = interaction.options.getInteger('limit') || 50;
            const typeFilter = interaction.options.getString('type');

            // Récupérer les logs
            const filter = {};
            if (typeFilter) {
                filter.type = typeFilter;
            }
            filter.limit = limit;

            const logs = logger.getHistory(filter);
            const stats = logger.getStats();

            if (logs.length === 0) {
                return interaction.editReply({
                    embeds: [error('Aucun log', 'Aucun log trouvé avec les critères spécifiés.')]
                });
            }

            // Créer l'embed principal avec les statistiques
            const mainEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📋 Logs du Bot')
                .setDescription(`**Statistiques globales :**\n` +
                    `📊 Total: ${stats.total}\n` +
                    `✅ Success: ${stats.success}\n` +
                    `ℹ️ Info: ${stats.info}\n` +
                    `⚠️ Warnings: ${stats.warn}\n` +
                    `❌ Errors: ${stats.error}\n` +
                    `🔍 Debug: ${stats.debug}\n\n` +
                    `**Affichage des ${logs.length} derniers logs${typeFilter ? ` (type: ${typeFilter})` : ''} :**`)
                .setTimestamp();

            // Créer les embeds pour les logs (limiter à 10 champs par embed)
            const embeds = [mainEmbed];
            let currentEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('📝 Détails des Logs')
                .setTimestamp();

            let fieldCount = 0;
            const maxFieldsPerEmbed = 10;

            // Grouper les logs par type pour une meilleure lisibilité
            const logsByType = {};
            logs.forEach(log => {
                if (!logsByType[log.type]) {
                    logsByType[log.type] = [];
                }
                logsByType[log.type].push(log);
            });

            // Ajouter les logs groupés par type
            for (const [logType, typeLogs] of Object.entries(logsByType)) {
                const typeEmoji = {
                    'info': 'ℹ️',
                    'success': '✅',
                    'warn': '⚠️',
                    'error': '❌',
                    'debug': '🔍'
                }[logType] || '📝';

                // Limiter à 5 logs par type pour éviter la surcharge
                const displayLogs = typeLogs.slice(-5);
                const logText = displayLogs.map(log => {
                    const time = log.timestamp.toLocaleTimeString('fr-FR');
                    return `\`[${time}]\` ${log.message}`;
                }).join('\n');

                if (fieldCount >= maxFieldsPerEmbed) {
                    embeds.push(currentEmbed);
                    currentEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('📝 Suite des Logs')
                        .setTimestamp();
                    fieldCount = 0;
                }

                currentEmbed.addFields({
                    name: `${typeEmoji} ${logType.toUpperCase()} (${typeLogs.length})`,
                    value: logText.length > 1024 ? logText.substring(0, 1020) + '...' : logText,
                    inline: false
                });

                fieldCount++;
            }

            if (fieldCount > 0) {
                embeds.push(currentEmbed);
            }

            // Envoyer les embeds (Discord limite à 10 embeds par message)
            const embedsToSend = embeds.slice(0, 10);
            await interaction.editReply({ embeds: embedsToSend });

            logger.info(`Logs consultés par ${interaction.user.tag}`, { 
                user: interaction.user.tag, 
                limit, 
                typeFilter 
            });

        } catch (err) {
            logger.error(`Erreur lors de l'affichage des logs: ${err.message}`, { 
                error: err.message, 
                stack: err.stack 
            });
            await interaction.editReply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la récupération des logs.')]
            });
        }
    }
};
