const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { success, error, info, warning } = require('../utils/embeds');
const { isStaff } = require('../utils/permissions');
const logger = require('../utils/logger');

// Importer toutes les commandes setup
const setupReglement = require('./setup/setup-reglement');
const setupDescriptions = require('./setup/setup-descriptions');
const setupRoles = require('./setup/setup-roles');
const setupChannels = require('./setup/setup-channels');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('all')
        .setDescription('Reset complet puis configuration complète du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!isStaff(interaction.member)) {
            return interaction.reply({
                embeds: [error('Permission refusée', 'Vous devez être staff pour utiliser cette commande.')],
                ephemeral: true
            });
        }

        const guild = interaction.guild;
        const currentChannel = interaction.channel;

            // Message de démarrage
        await interaction.reply({
            embeds: [info('Configuration complète — démarrage', '🚀 Démarrage du reset et de la configuration complète du serveur...\n\n⚠️ **ATTENTION** : Cette opération va supprimer toutes les catégories, salons et rôles (sauf @everyone et les rôles bots).\n\nCette opération peut prendre quelques instants.')],
            ephemeral: true
        });

        const results = {
            reset: [],
            setup: []
        };
        let hasError = false;

        try {
            // ==========================================
            // PHASE 1 : RESET COMPLET
            // ==========================================
            logger.info(`=== RESET COMPLET démarré par ${interaction.user.tag} ===`, { user: interaction.user.tag });

            // 1.1 Supprimer toutes les catégories
            try {
                // Rafraîchir le cache avant de supprimer
                await guild.channels.fetch();
                const categories = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory);
                let deletedCategories = 0;
                let errorCategories = 0;
                
                for (const category of categories.values()) {
                    try {
                        // Vérifier que la catégorie existe toujours
                        const fetchedCategory = await guild.channels.fetch(category.id).catch(() => null);
                        if (!fetchedCategory) {
                            logger.debug(`Catégorie ${category.name} déjà supprimée`);
                            continue;
                        }
                        
                        await fetchedCategory.delete();
                        deletedCategories++;
                        logger.debug(`Catégorie supprimée: ${category.name}`, { category: category.name });
                        
                        // Petite pause entre chaque suppression pour éviter les rate limits
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } catch (err) {
                        errorCategories++;
                        logger.warn(`Impossible de supprimer la catégorie ${category.name}: ${err.message}`, { 
                            category: category.name, 
                            error: err.message 
                        });
                    }
                }
                
                results.reset.push(`✅ Catégories supprimées: ${deletedCategories}${errorCategories > 0 ? ` (${errorCategories} erreurs)` : ''}`);
                logger.info(`${deletedCategories} catégorie(s) supprimée(s)`, { deleted: deletedCategories, errors: errorCategories });
            } catch (err) {
                logger.error(`Erreur lors de la suppression des catégories: ${err.message}`, { error: err.message, stack: err.stack });
                results.reset.push(`❌ Catégories: ${err.message}`);
                hasError = true;
            }

            // Pause pour laisser Discord traiter les suppressions
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 1.2 Supprimer tous les salons (sauf le canal actuel pour pouvoir répondre)
            try {
                // Rafraîchir le cache
                await guild.channels.fetch();
                const channels = guild.channels.cache.filter(c => 
                    c.type !== ChannelType.GuildCategory && 
                    c.id !== currentChannel.id &&
                    c.deletable
                );
                let deletedChannels = 0;
                let errorChannels = 0;
                
                for (const channel of channels.values()) {
                    try {
                        // Vérifier que le salon existe toujours
                        const fetchedChannel = await guild.channels.fetch(channel.id).catch(() => null);
                        if (!fetchedChannel) {
                            logger.debug(`Salon ${channel.name} déjà supprimé`);
                            continue;
                        }
                        
                        await fetchedChannel.delete();
                        deletedChannels++;
                        logger.debug(`Salon supprimé: ${channel.name}`, { channel: channel.name });
                        
                        // Petite pause entre chaque suppression
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } catch (err) {
                        errorChannels++;
                        // Ignorer les erreurs "Unknown Channel" car le salon peut déjà être supprimé
                        if (!err.message.includes('Unknown Channel') && !err.message.includes('Unknown')) {
                            logger.warn(`Impossible de supprimer le salon ${channel.name}: ${err.message}`, { 
                                channel: channel.name, 
                                error: err.message 
                            });
                        }
                    }
                }
                
                results.reset.push(`✅ Salons supprimés: ${deletedChannels}${errorChannels > 0 ? ` (${errorChannels} erreurs)` : ''}`);
                logger.info(`${deletedChannels} salon(s) supprimé(s)`, { deleted: deletedChannels, errors: errorChannels });
            } catch (err) {
                logger.error(`Erreur lors de la suppression des salons: ${err.message}`, { error: err.message, stack: err.stack });
                results.reset.push(`❌ Salons: ${err.message}`);
                hasError = true;
            }

            // Pause pour laisser Discord traiter les suppressions
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 1.3 Supprimer tous les rôles (sauf @everyone et managed)
            try {
                // Rafraîchir le cache des rôles
                await guild.roles.fetch();
                const roles = guild.roles.cache.filter(role => 
                    role.name !== '@everyone' && 
                    !role.managed &&
                    role.deletable
                );
                let deletedRoles = 0;
                let errorRoles = 0;
                
                for (const role of roles.values()) {
                    try {
                        // Vérifier que le rôle existe toujours
                        const fetchedRole = await guild.roles.fetch(role.id).catch(() => null);
                        if (!fetchedRole) {
                            logger.debug(`Rôle ${role.name} déjà supprimé`);
                            continue;
                        }
                        
                        await fetchedRole.delete();
                        deletedRoles++;
                        logger.debug(`Rôle supprimé: ${role.name}`, { role: role.name });
                        
                        // Petite pause entre chaque suppression
                        await new Promise(resolve => setTimeout(resolve, 200));
                    } catch (err) {
                        errorRoles++;
                        logger.warn(`Impossible de supprimer le rôle ${role.name}: ${err.message}`, { 
                            role: role.name, 
                            error: err.message 
                        });
                    }
                }
                
                results.reset.push(`✅ Rôles supprimés: ${deletedRoles}${errorRoles > 0 ? ` (${errorRoles} erreurs)` : ''}`);
                logger.info(`${deletedRoles} rôle(s) supprimé(s)`, { deleted: deletedRoles, errors: errorRoles });
            } catch (err) {
                logger.error(`Erreur lors de la suppression des rôles: ${err.message}`, { error: err.message, stack: err.stack });
                results.reset.push(`❌ Rôles: ${err.message}`);
                hasError = true;
            }

            logger.info(`=== RESET COMPLET terminé ===`);

            // Pause avant le setup pour s'assurer que tout est bien supprimé
            await new Promise(resolve => setTimeout(resolve, 2000));

            // ==========================================
            // PHASE 2 : SETUP COMPLET
            // ==========================================
            logger.info(`=== SETUP COMPLET démarré ===`);

            const setupSteps = [
                { name: 'Rôles', command: setupRoles },
                { name: 'Salons', command: setupChannels },
                { name: 'Règlement', command: setupReglement },
                { name: 'Descriptions', command: setupDescriptions }
            ];

            for (const step of setupSteps) {
                try {
                    logger.info(`Exécution de setup-${step.name.toLowerCase()}...`, { step: step.name });
                    
                    // Créer une interaction simulée pour chaque commande avec gestion d'erreurs améliorée
                    let replied = false;
                    const fakeInteraction = {
                        ...interaction,
                        guild: guild,
                        member: interaction.member,
                        user: interaction.user,
                        client: interaction.client,
                        options: {
                            getString: () => null,
                            getInteger: () => null,
                            getChannel: () => null,
                            getUser: () => null
                        },
                        reply: async (content) => {
                            // Ne rien faire pour les réponses intermédiaires mais éviter les erreurs
                            if (!replied) {
                                replied = true;
                            }
                            return { fetchReply: () => Promise.resolve({}) };
                        },
                        followUp: async (content) => {
                            // Ne rien faire pour les followUp intermédiaires
                            return Promise.resolve({});
                        }
                    };

                    await step.command.execute(fakeInteraction);
                    results.setup.push(`✅ ${step.name}`);
                    logger.success(`Setup ${step.name} terminé avec succès`, { step: step.name });
                    
                    // Pause entre les étapes pour éviter les collisions
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (err) {
                    logger.error(`Erreur lors de l'exécution de ${step.name}: ${err.message}`, { 
                        step: step.name, 
                        error: err.message, 
                        stack: err.stack 
                    });
                    results.setup.push(`❌ ${step.name}: ${err.message}`);
                    hasError = true;
                }
            }

            logger.info(`=== SETUP COMPLET terminé ===`);

            // ==========================================
            // PHASE 3 : MESSAGES AUTOMATIQUES
            // ==========================================
            try {
                // Attendre que les salons soient créés et rafraîchir le cache
                logger.info('Attente de la création des salons...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Rafraîchir le cache des salons
                try {
                    await guild.channels.fetch();
                    logger.debug('Cache des salons rafraîchi');
                } catch (err) {
                    logger.warn(`Impossible de rafraîchir le cache: ${err.message}`);
                }

                // Attendre encore un peu pour être sûr
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Chercher le salon annonces pour envoyer le message de fin
                let annoncesChannel = guild.channels.cache.find(
                    c => c.name === 'annonces' && c.type === ChannelType.GuildText
                );

                // Si le salon n'est pas trouvé, essayer de le chercher à nouveau après un délai
                if (!annoncesChannel) {
                    logger.warn('Salon annonces non trouvé dans le cache, nouvelle tentative...');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    try {
                        await guild.channels.fetch();
                        annoncesChannel = guild.channels.cache.find(
                            c => c.name === 'annonces' && c.type === ChannelType.GuildText
                        );
                    } catch (err) {
                        logger.warn(`Erreur lors de la recherche du salon annonces: ${err.message}`);
                    }
                }

                if (annoncesChannel) {
                    try {
                        // Vérifier que le salon existe toujours et est accessible
                        await annoncesChannel.fetch().catch(() => {
                            throw new Error('Salon inaccessible');
                        });

                        const completionEmbed = hasError
                            ? warning('Configuration terminée avec avertissements', 
                                `La configuration du serveur KyLabsCrew a été effectuée avec quelques avertissements.\n\n` +
                                `**Résumé du reset :**\n${results.reset.join('\n')}\n\n` +
                                `**Résumé du setup :**\n${results.setup.join('\n')}\n\n` +
                                `Vérifiez les logs pour plus de détails.`)
                            : success('Configuration terminée — succès', 
                                `La configuration complète du serveur KyLabsCrew a été effectuée avec succès ! 🎉\n\n` +
                                `**Résumé du reset :**\n${results.reset.join('\n')}\n\n` +
                                `**Résumé du setup :**\n${results.setup.join('\n')}\n\n` +
                                `Le serveur est maintenant prêt à être utilisé !`);

                        await annoncesChannel.send({ embeds: [completionEmbed] });
                        logger.info(`Message de fin envoyé dans ${annoncesChannel.name}`);
                    } catch (err) {
                        logger.warn(`Impossible d'envoyer le message dans annonces: ${err.message}`);
                        logger.debug(err.stack);
                    }
                } else {
                    logger.warn('Salon annonces non trouvé après plusieurs tentatives, message de fin non envoyé');
                }
            } catch (err) {
                logger.error(`Erreur lors de l'envoi des messages automatiques: ${err.message}`);
                logger.debug(err.stack);
            }

            // Message final pour l'utilisateur
            const finalEmbed = hasError
                ? warning('Configuration terminée avec avertissements', 
                    `La configuration a été effectuée avec quelques avertissements.\n\n` +
                    `**Reset :**\n${results.reset.join('\n')}\n\n` +
                    `**Setup :**\n${results.setup.join('\n')}\n\n` +
                    `Consultez les logs pour plus de détails.`)
                : success('Configuration terminée — succès', 
                    `Toutes les étapes ont été exécutées avec succès ! 🎉\n\n` +
                    `**Reset :**\n${results.reset.join('\n')}\n\n` +
                    `**Setup :**\n${results.setup.join('\n')}\n\n` +
                    `Le serveur est maintenant configuré et prêt à être utilisé !`);

            try {
                // Vérifier que l'interaction n'a pas expiré avant d'envoyer le followUp
                if (interaction.isRepliable() && !interaction.ephemeral) {
                    await interaction.followUp({
                        embeds: [finalEmbed],
                        ephemeral: true
                    });
                } else {
                    // Si l'interaction a expiré ou est en mode ephemeral, essayer de répondre dans le canal actuel
                    const finalChannel = await guild.channels.fetch(currentChannel.id).catch(() => null);
                    if (finalChannel) {
                        await finalChannel.send({ embeds: [finalEmbed] });
                        logger.info('Message final envoyé dans le canal actuel', { channel: currentChannel.name });
                    }
                }
            } catch (err) {
                // Si le followUp échoue (interaction expirée, salon supprimé, etc.), essayer de répondre dans le canal actuel
                logger.warn(`Impossible d'envoyer le followUp: ${err.message}`, { error: err.message });
                try {
                    const finalChannel = await guild.channels.fetch(currentChannel.id).catch(() => null);
                    if (finalChannel) {
                        await finalChannel.send({ embeds: [finalEmbed] });
                        logger.info('Message final envoyé dans le canal actuel après erreur', { channel: currentChannel.name });
                    } else {
                        logger.error('Canal actuel introuvable ou supprimé, impossible d\'envoyer le message final');
                    }
                } catch (err2) {
                    logger.error(`Impossible d'envoyer le message final: ${err2.message}`, { error: err2.message });
                }
            }

            logger.success(`Configuration complète terminée par ${interaction.user.tag} - Erreurs: ${hasError ? 'Oui' : 'Non'}`);

        } catch (err) {
            logger.error(`Erreur critique lors de la configuration complète: ${err.message}`);
            logger.debug(err.stack);
            try {
                // Vérifier que l'interaction est toujours valide
                if (interaction.isRepliable() && !interaction.ephemeral) {
                    await interaction.followUp({
                        embeds: [error('Erreur critique', `Une erreur critique est survenue lors de la configuration.\n\n**Erreur:** ${err.message}\n\nVérifiez les logs pour plus de détails.`)],
                        ephemeral: true
                    });
                } else {
                    // Si l'interaction a expiré, essayer d'envoyer dans le canal actuel
                    const errorChannel = await guild.channels.fetch(currentChannel.id).catch(() => null);
                    if (errorChannel) {
                        await errorChannel.send({
                            embeds: [error('Erreur critique', `Une erreur critique est survenue lors de la configuration.\n\n**Erreur:** ${err.message}\n\nVérifiez les logs pour plus de détails.`)]
                        });
                    }
                }
            } catch (err2) {
                // Si même le followUp échoue, essayer d'envoyer dans le canal actuel
                logger.error(`Impossible d'envoyer le message d'erreur critique: ${err2.message}`, { error: err2.message });
                try {
                    const errorChannel = await guild.channels.fetch(currentChannel.id).catch(() => null);
                    if (errorChannel) {
                        await errorChannel.send({
                            embeds: [error('Erreur critique', `Une erreur critique est survenue lors de la configuration.\n\n**Erreur:** ${err.message}\n\nVérifiez les logs pour plus de détails.`)]
                        });
                        logger.info('Message d\'erreur envoyé dans le canal actuel', { channel: currentChannel.name });
                    } else {
                        logger.error('Canal actuel introuvable ou supprimé, impossible d\'envoyer le message d\'erreur');
                    }
                } catch (err3) {
                    logger.error(`Impossible d'envoyer le message d'erreur dans le canal: ${err3.message}`, { error: err3.message });
                }
            }
        }
    }
};
