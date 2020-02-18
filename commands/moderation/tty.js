const Commando = require('discord.js-commando');
const {spawn} = require('child_process');

const fs = require('fs');
const config = JSON.parse(fs.readFileSync('settings/tty_settings.json', 'utf-8'));

module.exports = class TtyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'tty',
            group: 'moderation',
            aliases: ['terminal'],
            memberName: 'tty',
            description: 'Open a web TTY.',
            ownerOnly: true,
        });
    }

    async run(msg) {
        const srv = spawn('node', ['scripts/tty.js']);
        srv.on('close', () => msg.channel.send('TTY closed.'));

        return msg.channel.send(`TTY started at ${config.url}`);
    }
};
