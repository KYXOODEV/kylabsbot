require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');

// Variables d'environnement
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];

function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = `${dir}/${file.name}`;
        
        if (file.isDirectory()) {
            loadCommands(filePath);
        } else if (file.name.endsWith('.js')) {
            const command = require(`./${filePath}`);
            if (command.data) {
                commands.push(command.data.toJSON());
            }
        }
    }
}

loadCommands('./commands');

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log("Déploiement des commandes slash…");

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log("Commandes enregistrées !");
    } catch (error) {
        console.error(error);
    }
})();
