const { EmbedBuilder } = require('discord.js');

module.exports = {
    success: (title, description) => {
        return new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(`✅ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },
    
    error: (title, description) => {
        return new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`❌ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },
    
    info: (title, description) => {
        return new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`ℹ️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },
    
    warning: (title, description) => {
        return new EmbedBuilder()
            .setColor(0xFFAA00)
            .setTitle(`⚠️ ${title}`)
            .setDescription(description)
            .setTimestamp();
    },
    
    staff: (title, description, fields = []) => {
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle(`🔒 ${title}`)
            .setDescription(description)
            .setTimestamp();
        
        if (fields.length > 0) {
            embed.addFields(fields);
        }
        
        return embed;
    },
    
    creator: (title, description, fields = []) => {
        const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`🎥 ${title}`)
            .setDescription(description)
            .setTimestamp();
        
        if (fields.length > 0) {
            embed.addFields(fields);
        }
        
        return embed;
    },
    
    community: (title, description, fields = []) => {
        const embed = new EmbedBuilder()
            .setColor(0x00D4FF)
            .setTitle(`💬 ${title}`)
            .setDescription(description)
            .setTimestamp();
        
        if (fields.length > 0) {
            embed.addFields(fields);
        }
        
        return embed;
    }
};
