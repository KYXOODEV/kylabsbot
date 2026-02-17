const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { success, error, info } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-descriptions')
        .setDescription('Configure les descriptions des salons')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

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

        await safeReply({ content: "⚙️ Configuration des descriptions en cours…", ephemeral: true });

        const descriptions = {
            // ACCUEIL
            'welcome': '👋 Bienvenue sur le serveur KyLabsCrew ! Présentez-vous ici et découvrez notre communauté de créateurs.',
            'règlement': '📋 Consultez le règlement du serveur pour connaître toutes les règles à respecter.',
            'annonces': '📢 Restez informé des dernières annonces et mises à jour du serveur.',
            'news-youtube': '📺 Toutes les actualités YouTube, tendances et nouveautés de la plateforme.',
            
            // COMMUNAUTÉ
            'général': '💬 Discutez librement avec la communauté dans ce salon général.',
            'clips': '🎬 Partagez vos meilleurs clips et moments forts ici !',
            'screenshots': '📸 Partagez vos captures d\'écran et images avec la communauté.',
            'présentations': '👋 Présentez-vous à la communauté et faites connaissance avec les autres membres.',
            'suggestions': '💡 Partagez vos suggestions et idées pour améliorer le serveur.',
            'sondages': '📊 Participez aux sondages de la communauté et votez sur différents sujets.',
            
            // CRÉATEURS & COACHING
            'feedback-vidéos': '🎥 Demandez des retours sur vos vidéos et recevez des conseils de la communauté.',
            'idées-contenu': '💡 Partagez vos idées de contenu et discutez de vos projets vidéo.',
            'ressources': '📚 Accédez aux ressources et outils pour créateurs (templates, guides, etc.).',
            'miniatures': '🖼️ Partagez et obtenez des retours sur vos miniatures YouTube.',
            'scripts': '📝 Partagez vos scripts et obtenez des conseils pour améliorer votre contenu.',
            'planning-vidéos': '📅 Organisez et planifiez vos prochaines vidéos avec la communauté.',
            
            // MANAGEMENT YOUTUBE
            'analytics': '📊 Analysez vos statistiques YouTube et discutez de vos performances.',
            'objectifs': '🎯 Définissez et suivez vos objectifs de croissance sur YouTube.',
            'tâches': '✅ Organisez vos tâches et suivez l\'avancement de vos projets vidéo.',
            'projets': '🚀 Gérez vos projets vidéo en cours et à venir.',
            'sponsors': '💰 Discutez des opportunités de sponsoring et partenariats.',
            'collaborations': '🤝 Organisez des collaborations avec d\'autres créateurs.',
            
            // STAFF
            'staff-chat': '🔒 Salon privé réservé au staff pour les discussions internes.',
            'logs': '📝 Logs automatiques des actions et événements du serveur.'
        };

        // Messages automatiques pour chaque salon
        const channelMessages = {
            'général': '💬 **Salon pour discuter avec la communauté**\n\nCe salon est destiné aux discussions générales avec tous les membres du serveur. Partagez vos idées, posez des questions et échangez avec la communauté !',
            'staff-chat': '🔒 **Salon réservé au staff pour l\'organisation interne**\n\nCe salon est privé et accessible uniquement aux membres du staff et aux administrateurs. Utilisez-le pour coordonner les actions du serveur.',
            'feedback-vidéos': '🎥 **Poste ta vidéo et reçois un feedback**\n\nPartagez vos vidéos ici pour recevoir des retours constructifs de la communauté et améliorer votre contenu !',
            'analytics': '📊 **Statistiques YouTube et suivi des performances**\n\nDiscutez de vos statistiques YouTube, analysez vos performances et partagez vos insights avec la communauté de créateurs.',
            'suggestions': '💡 **Propose tes idées pour améliorer le serveur**\n\nAvez-vous une idée pour améliorer le serveur ? Partagez-la ici ! Toutes les suggestions sont les bienvenues.',
            'présentations': '👋 **Présente-toi à la communauté**\n\nNouveau membre ? Présentez-vous ici et faites connaissance avec la communauté KyLabsCrew !',
            'welcome': '👋 **Bienvenue sur KyLabsCrew !**\n\nCe salon est dédié aux messages de bienvenue. Les nouveaux membres y sont accueillis automatiquement.',
            'règlement': '📋 **Règlement du serveur**\n\nConsultez les règles du serveur pour garantir une expérience agréable pour tous.',
            'annonces': '📢 **Annonces importantes**\n\nRestez informé des dernières nouvelles et annonces du serveur.',
            'news-youtube': '📺 **Actualités YouTube**\n\nToutes les dernières nouvelles de YouTube, les tendances et les nouveautés de la plateforme.',
            'clips': '🎬 **Partage tes meilleurs clips**\n\nPartagez vos meilleurs moments et clips avec la communauté !',
            'screenshots': '📸 **Partage tes captures d\'écran**\n\nPartagez vos captures d\'écran et images avec la communauté.',
            'sondages': '📊 **Sondages de la communauté**\n\nParticipez aux sondages et votez sur différents sujets.',
            'idées-contenu': '💡 **Idées de contenu**\n\nPartagez vos idées de contenu et discutez de vos projets vidéo avec la communauté.',
            'ressources': '📚 **Ressources pour créateurs**\n\nAccédez aux ressources et outils pour créateurs : templates, guides, tutoriels, etc.',
            'miniatures': '🖼️ **Miniatures YouTube**\n\nPartagez et obtenez des retours sur vos miniatures YouTube.',
            'scripts': '📝 **Scripts vidéo**\n\nPartagez vos scripts et obtenez des conseils pour améliorer votre contenu.',
            'planning-vidéos': '📅 **Planning des vidéos**\n\nOrganisez et planifiez vos prochaines vidéos avec la communauté.',
            'objectifs': '🎯 **Objectifs YouTube**\n\nDéfinissez et suivez vos objectifs de croissance sur YouTube.',
            'tâches': '✅ **Tâches et organisation**\n\nOrganisez vos tâches et suivez l\'avancement de vos projets vidéo.',
            'projets': '🚀 **Projets vidéo**\n\nGérez vos projets vidéo en cours et à venir.',
            'sponsors': '💰 **Sponsors et partenariats**\n\nDiscutez des opportunités de sponsoring et partenariats.',
            'collaborations': '🤝 **Collaborations**\n\nOrganisez des collaborations avec d\'autres créateurs.',
            'logs': '📝 **Logs automatiques**\n\nCe salon contient les logs automatiques des actions et événements du serveur.'
        };

        try {
            let updated = 0;
            let messagesSent = 0;
            let notFound = [];

            // Rafraîchir le cache des salons
            await interaction.guild.channels.fetch();

            for (const [channelName, description] of Object.entries(descriptions)) {
                const channel = interaction.guild.channels.cache.find(
                    c => c.name === channelName && c.type === ChannelType.GuildText
                );

                if (channel) {
                    try {
                        // Mettre à jour la description (topic)
                        await channel.setTopic(description);
                        updated++;
                        logger.debug(`Description mise à jour pour ${channelName}`, { channel: channelName });

                        // Envoyer un message automatique si défini
                        if (channelMessages[channelName]) {
                            try {
                                // Vérifier si un message automatique existe déjà (envoyé par le bot)
                                const messages = await channel.messages.fetch({ limit: 10 });
                                const existingMessage = messages.find(m => 
                                    m.author.id === interaction.client.user.id && 
                                    m.embeds.length > 0 &&
                                    m.embeds[0].description && 
                                    m.embeds[0].description.includes(channelMessages[channelName].split('\n')[0])
                                );

                                if (!existingMessage) {
                                    // Créer un embed pour le message automatique
                                    const messageEmbed = info(
                                        channelName.charAt(0).toUpperCase() + channelName.slice(1),
                                        channelMessages[channelName]
                                    );
                                    
                                    await channel.send({ embeds: [messageEmbed] });
                                    messagesSent++;
                                    logger.debug(`Message automatique envoyé dans ${channelName}`, { channel: channelName });
                                    
                                    // Petite pause pour éviter les rate limits
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                } else {
                                    logger.debug(`Message automatique déjà présent dans ${channelName}`, { channel: channelName });
                                }
                            } catch (err) {
                                logger.warn(`Impossible d'envoyer le message automatique dans ${channelName}: ${err.message}`, { 
                                    channel: channelName, 
                                    error: err.message 
                                });
                            }
                        }
                    } catch (err) {
                        logger.error(`Erreur lors de la mise à jour de ${channelName}: ${err.message}`, { 
                            channel: channelName, 
                            error: err.message 
                        });
                    }
                } else {
                    notFound.push(channelName);
                }
            }

            logger.info(`Descriptions configurées par ${interaction.user.tag} - ${updated} salons mis à jour, ${messagesSent} messages envoyés`, { 
                user: interaction.user.tag, 
                updated, 
                messagesSent 
            });

            let message = `✅ ${updated} salon(s) mis à jour avec succès.`;
            if (messagesSent > 0) {
                message += `\n📨 ${messagesSent} message(s) automatique(s) envoyé(s).`;
            }
            if (notFound.length > 0) {
                message += `\n⚠️ Salons non trouvés: ${notFound.join(', ')}`;
            }

            await safeReply({
                embeds: [success('Descriptions configurées', message)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la configuration des descriptions: ${err.message}`, { 
                error: err.message, 
                stack: err.stack 
            });
            await safeReply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la configuration des descriptions.')],
                ephemeral: true
            }).catch(() => {
                logger.error('Impossible d\'envoyer le message d\'erreur');
            });
        }
    }
};
