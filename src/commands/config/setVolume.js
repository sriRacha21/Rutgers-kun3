const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

module.exports = class SetVolumeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setvolume',
            group: 'config',
            memberName: 'volume',
            description: 'Set the volume of the bot in voice channels in this server. Default is 10. (0-100)',
            guildOnly: true,
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'volume',
                    type: 'integer|string',
                    prompt: 'Enter the desired volume for bots in this guild. Default is 20. (0-100). Type `clear` to reset the setting to default.',
                    min: 0,
                    max: 100
                }
            ]
        });
    }

    async run( msg, { volume } ) {
        const settings = this.client.provider;

        if ( typeof volume === 'string' ) {
            settings.remove( msg.guild, 'volume' );
            msg.channel.send( 'Cleared volume setting.' );
            return;
        }

        settings.set( msg.guild, 'volume', volume )
            .then( msg.channel.send( `Volume successfully set to ${volume}.` ));
    }
};
