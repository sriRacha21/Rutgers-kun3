const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

module.exports = class SetRoleResponseCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setroleresponse',
            group: 'config',
            memberName: 'roleresponse',
            description: 'Configure a response to be sent when a user adds a role.',
            userPermissions: [defaults.officer_permission],
            guildOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'Enter the role whose response you want to set.',
                    type: 'role'
                },
                {
                    key: 'response',
                    prompt: 'Enter the message you want the bot to send users that add the role. Enter `clear` to clear the setting.',
                    type: 'string'
                }
            ]
        });
    }

    async run(msg, { role, response }) {
        const settings = this.client.provider;

        if (response === 'clear') {
            settings.remove(msg.guild, `roleResponse:${role.id}`);
            return msg.channel.send('Successfully cleared role response.');
        }

        settings.set(msg.guild, `roleResponse:${role.id}`, response)
            .then(msg.channel.send('Role response successfully set.'));
    }
};
