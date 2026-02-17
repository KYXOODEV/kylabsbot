const { EmbedBuilder } = require('discord.js');
const { info } = require('../utils/embeds');
const logger = require('../utils/logger');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const guild = member.guild;
            
            // Chercher le salon welcome
            const welcomeChannel = guild.channels.cache.find(
                channel => channel.name === 'welcome' && channel.type === 0
            );

            // Chercher le rôle "Membre"
            const memberRole = guild.roles.cache.find(role => role.name === 'Membre');

            // Chercher le salon logs
            const logsChannel = guild.channels.cache.find(
                channel => channel.name === 'logs' && channel.type === 0
            );

            // Donner le rôle "Membre" au nouveau membre
            if (memberRole) {
                try {
                    await member.roles.add(memberRole);
                    logger.info(`Rôle "Membre" attribué à ${member.user.tag}`, { 
                        user: member.user.tag, 
                        userId: member.user.id 
                    });
                } catch (err) {
                    logger.warn(`Impossible d'attribuer le rôle Membre à ${member.user.tag}: ${err.message}`, { 
                        user: member.user.tag, 
                        error: err.message 
                    });
                }
            } else {
                logger.warn('Rôle "Membre" non trouvé, impossible de l\'attribuer au nouveau membre');
            }

            // Envoyer le message de bienvenue dans le salon welcome
            if (welcomeChannel) {
                try {
                    const welcomeEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('👋 Bienvenue sur KyLabsCrew !')
                        .setDescription(
                            `Bienvenue ${member.user} sur le serveur **KyLabsCrew** ! 🎉\n\n` +
                            `Nous sommes ravis de t'accueillir dans notre communauté de créateurs YouTube !\n\n` +
                            `**Pour commencer :**\n` +
                            `• Lis le règlement dans <#${guild.channels.cache.find(c => c.name === 'règlement')?.id || '#'}>\n` +
                            `• Présente-toi dans <#${guild.channels.cache.find(c => c.name === 'présentations')?.id || '#'}>\n` +
                            `• Rejoins les discussions dans <#${guild.channels.cache.find(c => c.name === 'général')?.id || '#'}>\n\n` +
                            `Bon contenu et à bientôt ! 🎥`
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp()
                        .setFooter({ text: `Membre #${guild.memberCount}` });

                    await welcomeChannel.send({ 
                        content: `${member.user}`, 
                        embeds: [welcomeEmbed] 
                    });
                    
                    logger.success(`Message de bienvenue envoyé pour ${member.user.tag}`, { 
                        user: member.user.tag, 
                        userId: member.user.id 
                    });
                } catch (err) {
                    logger.error(`Impossible d'envoyer le message de bienvenue pour ${member.user.tag}: ${err.message}`, { 
                        user: member.user.tag, 
                        error: err.message 
                    });
                }
            } else {
                logger.warn('Salon welcome non trouvé, message de bienvenue non envoyé');
            }

            // Logger dans le salon logs
            if (logsChannel) {
                try {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('👤 Nouveau membre')
                        .setDescription(`${member.user.tag} a rejoint le serveur`)
                        .addFields(
                            { name: 'Utilisateur', value: `${member.user} (${member.user.id})`, inline: true },
                            { name: 'Compte créé le', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`, inline: true },
                            { name: 'Total membres', value: `${guild.memberCount}`, inline: true }
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();

                    await logsChannel.send({ embeds: [logEmbed] });
                    logger.debug(`Log de nouveau membre envoyé pour ${member.user.tag}`, { 
                        user: member.user.tag 
                    });
                } catch (err) {
                    logger.warn(`Impossible d'envoyer le log dans le salon logs: ${err.message}`, { 
                        error: err.message 
                    });
                }
            }

        } catch (err) {
            logger.error(`Erreur lors du traitement du nouveau membre ${member.user.tag}: ${err.message}`, { 
                user: member.user.tag, 
                error: err.message, 
                stack: err.stack 
            });
        }
    }
};
