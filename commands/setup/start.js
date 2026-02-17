const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Configure entièrement le serveur KyLabsCrew.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.reply({ content: "🚀 Configuration du serveur KyLabsCrew en cours…", ephemeral: true });

        const guild = interaction.guild;

        // 1. SUPPRIMER LES SALONS
        for (const [id, channel] of guild.channels.cache) {
            await channel.delete().catch(() => {});
        }

        // 2. SUPPRIMER LES RÔLES (sauf @everyone et le bot)
        guild.roles.cache.forEach(async role => {
            if (
                role.name !== "@everyone" &&
                role.managed === false
            ) {
                await role.delete().catch(() => {});
            }
        });

        // 3. CRÉER LES RÔLES
        const roles = {
            admin: await guild.roles.create({ name: "Admin", color: "Red", permissions: ["Administrator"] }),
            staff: await guild.roles.create({ name: "Staff", color: "Blue" }),
            creator: await guild.roles.create({ name: "Créateur KyLabsCrew", color: "Gold" }),
            member: await guild.roles.create({ name: "Membre", color: "Green" }),
        };

        // 4. CRÉER LES CATÉGORIES + SALONS
        const accueil = await guild.channels.create({
            name: "📌 ACCUEIL",
            type: 4
        });

        await guild.channels.create({
            name: "welcome",
            type: 0,
            parent: accueil.id
        });

        await guild.channels.create({
            name: "règlement",
            type: 0,
            parent: accueil.id
        });

        await guild.channels.create({
            name: "annonces",
            type: 0,
            parent: accueil.id
        });

        const commu = await guild.channels.create({
            name: "💬 COMMUNAUTÉ",
            type: 4
        });

        await guild.channels.create({
            name: "général",
            type: 0,
            parent: commu.id
        });

        await guild.channels.create({
            name: "clips",
            type: 0,
            parent: commu.id
        });

        await guild.channels.create({
            name: "screenshots",
            type: 0,
            parent: commu.id
        });

        const creators = await guild.channels.create({
            name: "🎥 CRÉATEURS & COACHING",
            type: 4
        });

        await guild.channels.create({
            name: "feedback-vidéos",
            type: 0,
            parent: creators.id
        });

        await guild.channels.create({
            name: "idées-contenu",
            type: 0,
            parent: creators.id
        });

        await guild.channels.create({
            name: "ressources",
            type: 0,
            parent: creators.id
        });

        const staff = await guild.channels.create({
            name: "🔒 STAFF",
            type: 4,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ["ViewChannel"]
                },
                {
                    id: roles.staff.id,
                    allow: ["ViewChannel"]
                },
                {
                    id: roles.admin.id,
                    allow: ["ViewChannel"]
                }
            ]
        });

        await guild.channels.create({
            name: "staff-chat",
            type: 0,
            parent: staff.id
        });

        await guild.channels.create({
            name: "logs",
            type: 0,
            parent: staff.id
        });

        await interaction.followUp("✅ Le serveur KyLabsCrew a été configuré avec succès !");
    }
};
