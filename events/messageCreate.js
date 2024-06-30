const axios = require('axios');

module.exports = {
    name: 'messageCreate',
    execute(message, client) {
        if (!message.content.startsWith(client.config.prefix) || message.author.bot) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'ping') {
            message.channel.send('Pong!');
        } else if (command === 'stats') {
            sendServerStats(message.channel, client);
        }
    },
};

async function getServerStats(client) {
    try {
        const response = await axios.get(`http://${client.config.serverIP}:${client.config.serverPort}/players.json`);
        const players = response.data;

        const serverInfoResponse = await axios.get(`http://${client.config.serverIP}:${client.config.serverPort}/info.json`);
        const serverInfo = serverInfoResponse.data;

        return {
            playerCount: players.length,
            maxPlayers: serverInfo.vars.sv_maxClients,
            serverName: serverInfo.vars.sv_projectName,
        };
    } catch (error) {
        console.error('Sunucu istatistiklerini alırken hata oluştu:', error);
        return null;
    }
}

function createProgressBar(value, maxValue, size) {
    const percentage = value / maxValue;
    const progress = Math.round((size * percentage));
    const emptyProgress = size - progress;

    const progressText = '█'.repeat(progress);
    const emptyProgressText = '░'.repeat(emptyProgress);

    return `${progressText}${emptyProgressText} ${Math.round(percentage * 100)}%`;
}

async function sendServerStats(channel, client) {
    const stats = await getServerStats(client);
    if (stats) {
        const embed = {
            title: `${stats.serverName} - Sunucu İstatistikleri`,
            fields: [
                { name: '🧍 Oyuncu Sayısı', value: `${stats.playerCount}/${stats.maxPlayers}`, inline: true },
                { name: '🌐 Sunucu IP', value: `${client.config.serverIP}:${client.config.serverPort}`, inline: true },
                { name: '🔋 Doluluk Oranı', value: createProgressBar(stats.playerCount, stats.maxPlayers, 20), inline: false },
            ],
            footer: { text: 'Developed By Cheff' },
            color: 3447003,
            timestamp: new Date(),
        };

        channel.send({ embeds: [embed] }).then(response => {
            console.log('Sunucu istatistikleri başarıyla gönderildi.');
        }).catch(error => {
            console.error('Sunucu istatistikleri gönderilirken hata oluştu:', error);
        });
    }
}
