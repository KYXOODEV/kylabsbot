const { SlashCommandBuilder } = require('discord.js');
const { success, error, community } = require('../../utils/embeds');
const logger = require('../../utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Proposer une suggestion pour le serveur')
        .addStringOption(option =>
            option.setName('suggestion')
                .setDescription('Votre suggestion')
                .setRequired(true)
                .setMaxLength(1000))
        .addStringOption(option =>
            option.setName('categorie')
                .setDescription('Catégorie de la suggestion')
                .setRequired(false)
                .addChoices(
                    { name: 'Serveur', value: 'serveur' },
                    { name: 'Événements', value: 'evenements' },
                    { name: 'Salons', value: 'salons' },
                    { name: 'Rôles', value: 'roles' },
                    { name: 'Bot', value: 'bot' },
                    { name: 'Autre', value: 'autre' }
                )),

    async execute(interaction) {
        const suggestion = interaction.options.getString('suggestion');
        const category = interaction.options.getString('categorie') || 'autre';

        const categoryNames = {
            serveur: 'Serveur',
            evenements: 'Événements',
            salons: 'Salons',
            roles: 'Rôles',
            bot: 'Bot',
            autre: 'Autre'
        };

        try {
            const suggestChannel = interaction.guild.channels.cache.find(
                channel => channel.name === 'idées-contenu' && channel.type === 0
            ) || interaction.guild.channels.cache.find(
                channel => channel.name === 'général' && channel.type === 0
            );

            if (!suggestChannel) {
                return interaction.reply({
                    embeds: [error('Erreur', 'Aucun salon approprié trouvé pour les suggestions.')],
                    ephemeral: true
                });
            }

            const embed = community('Nouvelle suggestion', suggestion, [
                { name: '👤 Auteur', value: `${interaction.user.tag}`, inline: true },
                { name: '📂 Catégorie', value: categoryNames[category], inline: true },
                { name: '📅 Date', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            ]);

            const message = await suggestChannel.send({
                embeds: [embed]
            });

            // Ajouter des réactions pour voter
            await message.react('✅');
            await message.react('❌');

            logger.info(`Suggestion créée: ${interaction.user.tag} - Catégorie: ${categoryNames[category]}`);

            await interaction.reply({
                embeds: [success('Suggestion envoyée', `Votre suggestion a été publiée dans ${suggestChannel} !`)],
                ephemeral: true
            });
        } catch (err) {
            logger.error(`Erreur lors de la création de la suggestion: ${err.message}`);
            await interaction.reply({
                embeds: [error('Erreur', 'Une erreur est survenue lors de l\'envoi de votre suggestion.')],
                ephemeral: true
            });
        }
    }
};
