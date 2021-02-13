const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

module.exports = class SetWelcomeChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setwelcomechannel',
            group: 'config',
            memberName: 'welcomechannel',
            description: 'Configure the channel that is used to send welcome messages for new users. Just enter `clear` to clear the setting.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'welcomeChannel',
                    label: 'welcome channel',
                    prompt: 'Enter the channel you want to use to announce new user joins.',
                    type: 'channel|string'
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { welcomeChannel } ) {
        const settings = this.client.provider;

        if ( typeof welcomeChannel === 'object' ) {
            settings.set( msg.guild, 'welcomeChannel', welcomeChannel.id )
                .then( msg.channel.send( `Welcome channel successfully set as ${welcomeChannel}.` ) );
        } else if ( welcomeChannel === 'clear' ) {
            settings.remove( msg.guild, 'welcomeChannel' )
                .then( msg.channel.send( 'Welcome channel successfully removed.' ) );
        } else { msg.channel.send('Invalid input. Try again.'); }
    }
};
