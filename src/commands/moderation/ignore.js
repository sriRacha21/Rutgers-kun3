const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

module.exports = class IgnoreCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ignore',
            aliases: ['unignore'],
            group: 'moderation',
            memberName: 'ignore',
            description: 'Toggle ignoring a channel.',
            guildOnly: true,
            userPermissions: [defaults.moderator_permission],
            args: [
                {
                    key: 'channel',
                    prompt: 'Enter the channel .',
                    type: 'channel'
                }
            ]
        });
    }

    async run(msg, { channel }) {
        const settings = this.client.provider;

        const ignored = settings.get(msg.guild, `ignored:${channel.id}`);
        if (ignored) { settings.remove(msg.guild, `ignored:${channel.id}`); } else { settings.set(msg.guild, `ignored:${channel.id}`, true); }

        return msg.channel.send(`Successfully ${ignored ? 'un' : ''}ignored channel ${channel}.`);
    }
};
