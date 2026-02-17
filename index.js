require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const logger = require('./utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();

function loadCommands(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
        const filePath = `${dir}/${file.name}`;
        
        if (file.isDirectory()) {
            loadCommands(filePath);
        } else if (file.name.endsWith('.js')) {
            const command = require(`./${filePath}`);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
            }
        }
    }
}

loadCommands('./commands');

// Charger les événements
function loadEvents() {
    const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        logger.debug(`Événement chargé: ${event.name}`);
    }
}

loadEvents();

client.once('ready', () => {
    logger.success(`Bot connecté en tant que ${client.user.tag}`);
    logger.info(`Bot présent sur ${client.guilds.cache.size} serveur(s)`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(`Erreur lors de l'exécution de ${interaction.commandName}: ${error.message}`, { 
            command: interaction.commandName, 
            error: error.message, 
            stack: error.stack 
        });
        
        // Gérer les erreurs d'interaction déjà répondue
        if (interaction.replied || interaction.deferred) {
            try {
                await interaction.followUp({ 
                    content: "❌ Erreur lors de l'exécution de la commande.", 
                    ephemeral: true 
                });
            } catch (err) {
                // Ignorer les erreurs de followUp (salon supprimé, etc.)
                logger.warn(`Impossible d'envoyer le message d'erreur pour ${interaction.commandName}: ${err.message}`);
            }
        } else {
            try {
                await interaction.reply({ 
                    content: "❌ Erreur lors de l'exécution de la commande.", 
                    ephemeral: true 
                });
            } catch (err) {
                // Ignorer les erreurs de reply (interaction expirée, etc.)
                logger.warn(`Impossible de répondre à l'interaction ${interaction.commandName}: ${err.message}`);
            }
        }
    }
});

client.login(process.env.TOKEN);