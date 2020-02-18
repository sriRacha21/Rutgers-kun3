const Commando = require('discord.js-commando');
const {spawn} = require('child_process');

const fs = require('fs');
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'));
const config = JSON.parse(fs.readFileSync('settings/tty_settings.json', 'utf-8'));

module.exports = class TtyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'tty',
            group: 'moderation',
            aliases: ['terminal'],
            memberName: 'tty',
            description: 'tty',
        });
    }

    hasPermission(msg) {
        return this.client.isOwner(msg.author);
    }

    async run(msg) {
        const srv = spawn('node', ['scripts/tty.js']);
        srv.on('close', () => msg.channel.send('TTY closed.'));

        msg.channel.send(`TTY started at ${config.url}`);
    }
};
