const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { info } = require('../../utils/embeds');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes disponibles')
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Catégorie de commandes à afficher')
                .setRequired(false)
                .addChoices(
                    { name: 'Staff', value: 'staff' },
                    { name: 'Créateurs', value: 'creators' },
                    { name: 'Communauté', value: 'community' },
                    { name: 'Setup', value: 'setup' },
                    { name: 'Utils', value: 'utils' }
                )),

    async execute(interaction) {
        const category = interaction.options.getString('categorie');

        const categories = {
            staff: {
                name: '🔒 Commandes Staff',
                description: 'Commandes de modération réservées au staff',
                commands: [
                    { name: '/ban', description: 'Bannit un membre du serveur' },
                    { name: '/kick', description: 'Expulse un membre du serveur' },
                    { name: '/mute', description: 'Rend muet un membre pour une durée donnée' },
                    { name: '/warn', description: 'Avertit un membre' }
                ]
            },
            creators: {
                name: '🎥 Commandes Créateurs',
                description: 'Commandes pour les créateurs de contenu',
                commands: [
                    { name: '/apply', description: 'Postuler pour devenir créateur KyLabsCrew' },
                    { name: '/creator-panel', description: 'Crée un panneau pour les créateurs (staff only)' },
                    { name: '/feedback', description: 'Demander un feedback sur votre vidéo' }
                ]
            },
            community: {
                name: '💬 Commandes Communauté',
                description: 'Commandes pour la communauté',
                commands: [
                    { name: '/event', description: 'Créer un événement communautaire' },
                    { name: '/poll', description: 'Créer un sondage' },
                    { name: '/suggest', description: 'Proposer une suggestion pour le serveur' }
                ]
            },
            setup: {
                name: '⚙️ Commandes Setup',
                description: 'Commandes de configuration du serveur (admin only)',
                commands: [
                    { name: '/start', description: 'Configure entièrement le serveur KyLabsCrew' },
                    { name: '/setup-reglement', description: 'Configure le règlement du serveur' },
                    { name: '/setup-descriptions', description: 'Configure les descriptions des salons' },
                    { name: '/setup-roles', description: 'Configure les rôles du serveur' },
                    { name: '/setup-channels', description: 'Configure les salons du serveur' },
                    { name: '/all', description: 'Exécute toutes les commandes setup dans l\'ordre' }
                ]
            },
            utils: {
                name: '🛠️ Commandes Utilitaires',
                description: 'Commandes utilitaires générales',
                commands: [
                    { name: '/help', description: 'Affiche cette aide' },
                    { name: '/info', description: 'Affiche les informations sur le serveur' },
                    { name: '/ping', description: 'Répond Pong !' }
                ]
            }
        };

        if (category && categories[category]) {
            const cat = categories[category];
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(cat.name)
                .setDescription(cat.description)
                .setTimestamp();

            cat.commands.forEach(cmd => {
                embed.addFields({ name: cmd.name, value: cmd.description, inline: false });
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Afficher toutes les catégories
        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📚 Aide - Commandes KyLabsCrew')
            .setDescription('Utilisez `/help [categorie]` pour voir les commandes d\'une catégorie spécifique.\n\n**Catégories disponibles :**')
            .setTimestamp();

        Object.values(categories).forEach(cat => {
            embed.addFields({
                name: cat.name,
                value: `${cat.description}\n${cat.commands.map(c => `\`${c.name}\``).join(', ')}`,
                inline: false
            });
        });

        embed.setFooter({ text: 'Bot KyLabsCrew' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
