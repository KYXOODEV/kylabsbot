const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { creator, success, error } = require('../../utils/embeds');
const { isCreator, isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('creator-panel')
        .setDescription('Crée un panneau pour les créateurs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        const creatorsChannel = interaction.guild.channels.cache.find(
            channel => channel.name === 'ressources' && channel.type === 0
        );

        if (!creatorsChannel) {
            return interaction.reply({
                embeds: [error('Erreur', 'Le salon ressources n\'a pas été trouvé.')],
                ephemeral: true
            });
        }

        const embed = creator('Panneau Créateurs KyLabsCrew', `
Bienvenue dans l'espace dédié aux créateurs KyLabsCrew ! 🎥

**Ressources disponibles :**
• Partagez vos vidéos dans \`feedback-vidéos\`
• Proposez vos idées de contenu dans \`idées-contenu\`
• Accédez aux ressources et outils dans ce salon

**Commandes utiles :**
• \`/apply\` - Postuler pour devenir créateur
• \`/feedback\` - Demander des retours sur vos vidéos
• \`/suggest\` - Proposer une idée de contenu

**Avantages créateurs :**
✨ Accès aux ressources exclusives
✨ Retours personnalisés sur vos vidéos
✨ Support de la communauté
✨ Collaboration avec d'autres créateurs
        `);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('creator_apply')
                    .setLabel('Postuler')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId('creator_feedback')
                    .setLabel('Demander un feedback')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('💬'),
                new ButtonBuilder()
                    .setCustomId('creator_resources')
                    .setLabel('Ressources')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('📚')
            );

        try {
            await creatorsChannel.send({
                embeds: [embed],
                components: [row]
            });

            logger.info(`Panneau créateur créé par ${interaction.user.tag}`);

            await interaction.reply({
                embeds: [success('Panneau créé', 'Le panneau créateur a été créé avec succès !')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la création du panneau: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la création du panneau.')],
                ephemeral: true
            });
        }
    }
};
