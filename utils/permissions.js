const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    hasPermission: (member, permission) => {
        return member.permissions.has(permission);
    },
    
    isAdmin: (member) => {
        return member.permissions.has(PermissionFlagsBits.Administrator);
    },
    
    isStaff: (member) => {
        return member.permissions.has(PermissionFlagsBits.Administrator) ||
               member.roles.cache.some(role => role.name === 'Staff' || role.name === 'Admin');
    },
    
    isCreator: (member) => {
        return member.roles.cache.some(role => role.name === 'Créateur KyLabsCrew');
    },
    
    canModerate: (member, target) => {
        if (!member || !target) return false;
        if (member.id === target.id) return false;
        if (target.permissions.has(PermissionFlagsBits.Administrator)) return false;
        
        const memberHighest = member.roles.highest.position;
        const targetHighest = target.roles.highest.position;
        
        return memberHighest > targetHighest;
    }
};
