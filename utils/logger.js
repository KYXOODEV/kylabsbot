const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
};

// Stockage des logs pour la commande /logs
const logHistory = [];
const MAX_LOG_HISTORY = 1000; // Limiter à 1000 entrées pour éviter la surcharge mémoire

function getTimestamp() {
    return new Date().toLocaleString('fr-FR');
}

function addToHistory(type, message, details = {}) {
    logHistory.push({
        type,
        message,
        timestamp: new Date(),
        details
    });
    
    // Garder seulement les MAX_LOG_HISTORY dernières entrées
    if (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.shift();
    }
}

module.exports = {
    info: (message, details = {}) => {
        const logMessage = `${colors.cyan}[INFO]${colors.reset} [${getTimestamp()}] ${message}`;
        console.log(logMessage);
        addToHistory('info', message, details);
    },
    
    success: (message, details = {}) => {
        const logMessage = `${colors.green}[SUCCESS]${colors.reset} [${getTimestamp()}] ${message}`;
        console.log(logMessage);
        addToHistory('success', message, details);
    },
    
    warn: (message, details = {}) => {
        const logMessage = `${colors.yellow}[WARN]${colors.reset} [${getTimestamp()}] ${message}`;
        console.log(logMessage);
        addToHistory('warn', message, details);
    },
    
    error: (message, details = {}) => {
        const logMessage = `${colors.red}[ERROR]${colors.reset} [${getTimestamp()}] ${message}`;
        console.error(logMessage);
        addToHistory('error', message, details);
    },
    
    debug: (message, details = {}) => {
        const logMessage = `${colors.magenta}[DEBUG]${colors.reset} [${getTimestamp()}] ${message}`;
        console.log(logMessage);
        addToHistory('debug', message, details);
    },
    
    // Fonction pour récupérer l'historique des logs
    getHistory: (filter = {}) => {
        let filtered = [...logHistory];
        
        if (filter.type) {
            filtered = filtered.filter(log => log.type === filter.type);
        }
        
        if (filter.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        
        return filtered;
    },
    
    // Fonction pour obtenir les statistiques des logs
    getStats: () => {
        const stats = {
            total: logHistory.length,
            info: 0,
            success: 0,
            warn: 0,
            error: 0,
            debug: 0
        };
        
        logHistory.forEach(log => {
            if (stats.hasOwnProperty(log.type)) {
                stats[log.type]++;
            }
        });
        
        return stats;
    },
    
    // Fonction pour nettoyer l'historique
    clearHistory: () => {
        logHistory.length = 0;
    }
};
