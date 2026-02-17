const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { success, error } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-channels')
        .setDescription('Configure les salons du serveur')
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

        await safeReply({ content: "⚙️ Configuration des salons en cours…", ephemeral: true });

        const guild = interaction.guild;

        try {
            const createdChannels = [];
            const existingChannels = [];

            // Structure des catégories et salons
            const structure = [
                {
                    category: '📌 ACCUEIL',
                    channels: [
                        { name: 'welcome', type: ChannelType.GuildText, readOnly: false },
                        { name: 'règlement', type: ChannelType.GuildText, readOnly: true },
                        { name: 'annonces', type: ChannelType.GuildText, readOnly: true },
                        { name: 'news-youtube', type: ChannelType.GuildText, readOnly: true }
                    ],
                    readOnly: ['règlement', 'annonces', 'news-youtube']
                },
                {
                    category: '💬 COMMUNAUTÉ',
                    channels: [
                        { name: 'général', type: ChannelType.GuildText, readOnly: false },
                        { name: 'clips', type: ChannelType.GuildText, readOnly: false },
                        { name: 'screenshots', type: ChannelType.GuildText, readOnly: false },
                        { name: 'présentations', type: ChannelType.GuildText, readOnly: false },
                        { name: 'suggestions', type: ChannelType.GuildText, readOnly: false },
                        { name: 'sondages', type: ChannelType.GuildText, readOnly: false }
                    ],
                    readOnly: []
                },
                {
                    category: '🎥 CRÉATEURS & COACHING',
                    channels: [
                        { name: 'feedback-vidéos', type: ChannelType.GuildText, readOnly: false },
                        { name: 'idées-contenu', type: ChannelType.GuildText, readOnly: false },
                        { name: 'ressources', type: ChannelType.GuildText, readOnly: false },
                        { name: 'miniatures', type: ChannelType.GuildText, readOnly: false },
                        { name: 'scripts', type: ChannelType.GuildText, readOnly: false },
                        { name: 'planning-vidéos', type: ChannelType.GuildText, readOnly: false }
                    ],
                    creatorOnly: true,
                    readOnly: []
                },
                {
                    category: '📊 MANAGEMENT YOUTUBE',
                    channels: [
                        { name: 'analytics', type: ChannelType.GuildText, readOnly: false },
                        { name: 'objectifs', type: ChannelType.GuildText, readOnly: false },
                        { name: 'tâches', type: ChannelType.GuildText, readOnly: false },
                        { name: 'projets', type: ChannelType.GuildText, readOnly: false },
                        { name: 'sponsors', type: ChannelType.GuildText, readOnly: false },
                        { name: 'collaborations', type: ChannelType.GuildText, readOnly: false }
                    ],
                    managementOnly: true,
                    readOnly: []
                },
                {
                    category: '🔒 STAFF',
                    channels: [
                        { name: 'staff-chat', type: ChannelType.GuildText, readOnly: false },
                        { name: 'logs', type: ChannelType.GuildText, readOnly: false }
                    ],
                    staffOnly: true,
                    readOnly: []
                }
            ];

            // Récupérer les rôles nécessaires
            const everyoneRole = guild.roles.everyone;
            const memberRole = guild.roles.cache.find(r => r.name === 'Membre');
            const creatorRole = guild.roles.cache.find(r => r.name === 'Créateur KyLabsCrew');
            const staffRole = guild.roles.cache.find(r => r.name === 'Staff' || r.name === 'Admin');
            const adminRole = guild.roles.cache.find(r => r.name === 'Admin');

            for (const categoryData of structure) {
                // Chercher ou créer la catégorie
                let category = guild.channels.cache.find(
                    c => c.name === categoryData.category && c.type === ChannelType.GuildCategory
                );

                if (!category) {
                    category = await guild.channels.create({
                        name: categoryData.category,
                        type: ChannelType.GuildCategory
                    });
                }

                // Configurer les permissions de base pour la catégorie
                const permissionOverwrites = [];

                // Permissions pour STAFF uniquement
                if (categoryData.staffOnly) {
                    permissionOverwrites.push(
                        {
                            id: everyoneRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    );
                    if (memberRole) {
                        permissionOverwrites.push({
                            id: memberRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        });
                    }
                    if (staffRole) {
                        permissionOverwrites.push({
                            id: staffRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (adminRole) {
                        permissionOverwrites.push({
                            id: adminRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                }
                // Permissions pour MANAGEMENT YOUTUBE (créateur uniquement + staff + admin)
                else if (categoryData.managementOnly) {
                    permissionOverwrites.push(
                        {
                            id: everyoneRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    );
                    if (memberRole) {
                        permissionOverwrites.push({
                            id: memberRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        });
                    }
                    // Seul le créateur peut accéder (en plus du staff/admin)
                    if (creatorRole) {
                        permissionOverwrites.push({
                            id: creatorRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (staffRole) {
                        permissionOverwrites.push({
                            id: staffRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (adminRole) {
                        permissionOverwrites.push({
                            id: adminRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                }
                // Permissions pour CRÉATEURS uniquement
                else if (categoryData.creatorOnly) {
                    permissionOverwrites.push(
                        {
                            id: everyoneRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        }
                    );
                    if (memberRole) {
                        permissionOverwrites.push({
                            id: memberRole.id,
                            deny: [PermissionFlagsBits.ViewChannel]
                        });
                    }
                    if (creatorRole) {
                        permissionOverwrites.push({
                            id: creatorRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (staffRole) {
                        permissionOverwrites.push({
                            id: staffRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (adminRole) {
                        permissionOverwrites.push({
                            id: adminRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                }
                // Permissions pour ACCUEIL (lecture seule pour membres, écriture pour staff/admin)
                else if (categoryData.category === '📌 ACCUEIL') {
                    permissionOverwrites.push(
                        {
                            id: everyoneRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                            deny: [PermissionFlagsBits.SendMessages]
                        }
                    );
                    if (memberRole) {
                        permissionOverwrites.push({
                            id: memberRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory],
                            deny: [PermissionFlagsBits.SendMessages]
                        });
                    }
                    if (staffRole) {
                        permissionOverwrites.push({
                            id: staffRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                    if (adminRole) {
                        permissionOverwrites.push({
                            id: adminRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        });
                    }
                }
                // Permissions pour COMMUNAUTÉ (écriture pour tous les membres)
                else {
                    permissionOverwrites.push(
                        {
                            id: everyoneRole.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                        }
                    );
                }

                // Appliquer les permissions de catégorie
                if (permissionOverwrites.length > 0) {
                    try {
                        await category.permissionOverwrites.set(permissionOverwrites);
                        logger.debug(`Permissions configurées pour la catégorie ${categoryData.category}`, { 
                            category: categoryData.category 
                        });
                    } catch (err) {
                        logger.warn(`Erreur lors de la configuration des permissions de la catégorie ${categoryData.category}: ${err.message}`, { 
                            category: categoryData.category, 
                            error: err.message 
                        });
                    }
                }

                // Créer les salons dans la catégorie
                for (const channelData of categoryData.channels) {
                    let channel = guild.channels.cache.find(
                        c => c.name === channelData.name && c.type === channelData.type
                    );

                    const channelPermissions = [];

                    // Si le salon est en lecture seule (pour les salons spécifiques de la catégorie ACCUEIL)
                    if (channelData.readOnly || (categoryData.readOnly && categoryData.readOnly.includes(channelData.name))) {
                        channelPermissions.push(
                            {
                                id: everyoneRole.id,
                                deny: [PermissionFlagsBits.SendMessages]
                            }
                        );
                        if (memberRole) {
                            channelPermissions.push({
                                id: memberRole.id,
                                deny: [PermissionFlagsBits.SendMessages]
                            });
                        }
                        if (staffRole) {
                            channelPermissions.push({
                                id: staffRole.id,
                                allow: [PermissionFlagsBits.SendMessages]
                            });
                        }
                        if (adminRole) {
                            channelPermissions.push({
                                id: adminRole.id,
                                allow: [PermissionFlagsBits.SendMessages]
                            });
                        }
                    }

                    if (!channel) {
                        const channelOptions = {
                            name: channelData.name,
                            type: channelData.type,
                            parent: category.id
                        };

                        if (channelPermissions.length > 0) {
                            channelOptions.permissionOverwrites = channelPermissions;
                        }

                        channel = await guild.channels.create(channelOptions);
                        createdChannels.push(channelData.name);
                    } else {
                        // Déplacer le salon dans la bonne catégorie si nécessaire
                        if (channel.parentId !== category.id) {
                            await channel.setParent(category.id);
                        }
                        // Mettre à jour les permissions si nécessaire
                        if (channelPermissions.length > 0) {
                            try {
                                await channel.permissionOverwrites.set(channelPermissions);
                                logger.debug(`Permissions mises à jour pour ${channelData.name}`, { 
                                    channel: channelData.name 
                                });
                            } catch (err) {
                                logger.warn(`Erreur lors de la mise à jour des permissions de ${channelData.name}: ${err.message}`, { 
                                    channel: channelData.name, 
                                    error: err.message 
                                });
                            }
                        }
                        existingChannels.push(channelData.name);
                    }
                }
            }

            logger.info(`Salons configurés par ${interaction.user.tag} - Créés: ${createdChannels.length}, Existants: ${existingChannels.length}`, { 
                user: interaction.user.tag, 
                created: createdChannels.length, 
                existing: existingChannels.length 
            });

            let message = '';
            if (createdChannels.length > 0) {
                message += `✅ Salons créés: ${createdChannels.join(', ')}\n`;
            }
            if (existingChannels.length > 0) {
                message += `ℹ️ Salons existants: ${existingChannels.join(', ')}`;
            }

            await safeReply({
                embeds: [success('Salons configurés', message || 'Tous les salons sont déjà configurés.')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la configuration des salons: ${err.message}`, { 
                error: err.message, 
                stack: err.stack 
            });
            await safeReply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la configuration des salons.')],
                ephemeral: true
            }).catch((replyErr) => {
                // Si même le followUp échoue, on log juste l'erreur
                logger.error('Impossible d\'envoyer le message d\'erreur', { 
                    error: replyErr.message 
                });
            });
        }
    }
};
