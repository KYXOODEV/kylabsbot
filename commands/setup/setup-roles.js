const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { success, error } = require('../../utils/embeds');
const { isStaff } = require('../../utils/permissions');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('Configure les rôles du serveur')
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

        await safeReply({ content: "⚙️ Configuration des rôles en cours…", ephemeral: true });

        const guild = interaction.guild;
        // Couleurs en format hexadécimal pour Discord.js v14
        const rolesToCreate = [
            { name: 'Admin', color: 0xFF0000, permissions: [PermissionFlagsBits.Administrator], hoist: true }, // Red
            { name: 'Staff', color: 0x0000FF, permissions: [], hoist: true }, // Blue
            { name: 'Créateur KyLabsCrew', color: 0xFFD700, permissions: [], hoist: true }, // Gold
            { name: 'Membre', color: 0x00FF00, permissions: [], hoist: false }, // Green
            { name: 'Bot', color: 0x808080, permissions: [], hoist: false, optional: true } // Grey
        ];

        try {
            const createdRoles = [];
            const existingRoles = [];
            let hasError = false;

            for (const roleData of rolesToCreate) {
                try {
                    let role = guild.roles.cache.find(r => r.name === roleData.name);

                    if (!role) {
                        const roleOptions = {
                            name: roleData.name,
                            color: roleData.color,
                            hoist: roleData.hoist !== undefined ? roleData.hoist : false,
                            reason: `Configuration automatique par ${interaction.user.tag}`
                        };

                        if (roleData.permissions && roleData.permissions.length > 0) {
                            roleOptions.permissions = roleData.permissions;
                        }

                        role = await guild.roles.create(roleOptions);
                        createdRoles.push(roleData.name);
                        logger.debug(`Rôle créé: ${roleData.name}`);
                    } else {
                        // Mettre à jour la couleur et hoist si nécessaire
                        let updated = false;
                        if (role.color !== roleData.color) {
                            await role.setColor(roleData.color);
                            updated = true;
                        }
                        if (roleData.hoist !== undefined && role.hoist !== roleData.hoist) {
                            await role.setHoist(roleData.hoist);
                            updated = true;
                        }
                        if (updated) {
                            logger.debug(`Rôle mis à jour: ${roleData.name}`);
                        }
                        existingRoles.push(roleData.name);
                    }
                } catch (err) {
                    logger.warn(`Erreur lors de la création/mise à jour du rôle ${roleData.name}: ${err.message}`, { 
                        role: roleData.name, 
                        error: err.message 
                    });
                    if (!roleData.optional) {
                        // Si le rôle n'est pas optionnel, on ajoute une erreur
                        hasError = true;
                    }
                }
            }

            logger.info(`Rôles configurés par ${interaction.user.tag} - Créés: ${createdRoles.length}, Existants: ${existingRoles.length}`, { 
                user: interaction.user.tag, 
                created: createdRoles.length, 
                existing: existingRoles.length 
            });

            let message = '';
            if (createdRoles.length > 0) {
                message += `✅ Rôles créés: ${createdRoles.join(', ')}\n`;
            }
            if (existingRoles.length > 0) {
                message += `ℹ️ Rôles existants: ${existingRoles.join(', ')}`;
            }

            await safeReply({
                embeds: [success('Rôles configurés', message || 'Tous les rôles sont déjà configurés.')],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la configuration des rôles: ${err.message}`, { 
                error: err.message, 
                stack: err.stack 
            });
            await safeReply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de la configuration des rôles.')],
                ephemeral: true
            }).catch((replyErr) => {
                logger.error('Impossible d\'envoyer le message d\'erreur', { 
                    error: replyErr.message 
                });
            });
        }
    }
};
