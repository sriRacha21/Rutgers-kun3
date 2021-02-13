const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

module.exports = class SetlogChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setlogchannel',
            group: 'config',
            memberName: 'logchannel',
            description: 'Configure the log channel for this server. Just enter `clear` to clear the setting.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'logChannel',
                    label: 'log channel',
                    prompt: 'Enter the channel you want to log edited/deleted messages to.',
                    type: 'channel|string'
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { logChannel } ) {
        const settings = this.client.provider;

        if ( typeof logChannel === 'object' ) {
            settings.set( msg.guild, 'logChannel', logChannel.id )
                .then( msg.channel.send( `Log channel successfully set as ${logChannel}.` ) );
        } else if ( logChannel === 'clear' ) {
            settings.remove( msg.guild, 'logChannel' )
                .then( msg.channel.send( 'Log channel successfully removed.' ) );
        } else { msg.channel.send('Invalid input. Try again.'); }
    }
};
