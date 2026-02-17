const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { success, error, info } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-reglement')
        .setDescription('Configure le règlement du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option.setName('reglement')
                .setDescription('Le texte du règlement (ou "default" pour utiliser le règlement par défaut)')
                .setRequired(false)),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        // Vérifier si l'interaction a déjà été répondue
        let replied = false;
        const safeReply = async (content) => {
            if (!replied) {
                replied = true;
                return await interaction.reply(content);
            }
            return await interaction.followUp(content);
        };

        await safeReply({ content: "⚙️ Configuration du règlement en cours…", ephemeral: true });

        const reglementText = interaction.options.getString('reglement') || `📋 **RÈGLEMENT DU SERVEUR KYLABSCREW**

Bienvenue sur le serveur KyLabsCrew ! Pour garantir une expérience agréable pour tous, veuillez respecter les règles suivantes :

**1. RESPECT ET BIENVEILLANCE**
• Soyez respectueux envers tous les membres
• Pas de harcèlement, d'insultes ou de comportement toxique
• Tolérance zéro pour le racisme, le sexisme ou toute forme de discrimination

**2. CONTENU INTERDIT**
• Pas de contenu NSFW ou inapproprié
• Pas de spam ou de publicité non autorisée
• Pas de liens suspects ou malveillants

**3. UTILISATION DES SALONS**
• Utilisez les salons appropriés pour chaque type de contenu
• Respectez les sujets de discussion de chaque salon
• Pas de flood ou de messages répétitifs

**4. CRÉATEURS**
• Les créateurs doivent respecter les règles de la communauté
• Partagez vos contenus dans les salons dédiés
• Demandez l'autorisation avant de promouvoir vos chaînes

**5. SANCTIONS**
• Le non-respect des règles peut entraîner un avertissement, un mute, un kick ou un ban
• Les décisions du staff sont définitives

Merci de votre compréhension et bon contenu ! 🎥`;

        try {
            const reglementChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'règlement' && channel.type === ChannelType.GuildText
            );

            if (!reglementChannel) {
                return await safeReply({
                    embeds: [error('Erreur', 'Le salon règlement n\'a pas été trouvé. Utilisez /start pour créer la structure.')],
                    ephemeral: true
                });
            }

            // Supprimer les anciens messages du règlement
            try {
                const messages = await reglementChannel.messages.fetch({ limit: 50 });
                for (const message of messages.values()) {
                    if (message.author.id === interaction.client.user.id) {
                        try {
                            await message.delete();
                        } catch (deleteErr) {
                            // Ignorer les erreurs de suppression (message déjà supprimé, etc.)
                            logger.debug(`Impossible de supprimer un message dans règlement: ${deleteErr.message}`, { 
                                error: deleteErr.message 
                            });
                        }
                    }
                }
            } catch (fetchErr) {
                logger.warn(`Impossible de récupérer les messages du règlement: ${fetchErr.message}`, { 
                    error: fetchErr.message 
                });
            }

            const embed = info('Règlement du serveur', reglementText);
            await reglementChannel.send({ embeds: [embed] });

            logger.info(`Règlement configuré par ${interaction.user.tag}`, { 
                user: interaction.user.tag 
            });

            await safeReply({
                embeds: [success('Règlement configuré', 'Le règlement a été configuré avec succès dans le salon règlement.')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la configuration du règlement: ${err.message}`, { 
                error: err.message, 
                stack: err.stack 
            });
            await safeReply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la configuration du règlement.')],
                ephemeral: true
            }).catch((replyErr) => {
                logger.error('Impossible d\'envoyer le message d\'erreur', { 
                    error: replyErr.message 
                });
            });
        }
    }
};
