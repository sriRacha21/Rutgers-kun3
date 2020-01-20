const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
const oneLine = require('oneline');

module.exports = class ClearSettingsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'clear-guild-settings',
            group: 'settings',
            memberName: 'clear',
            description: 'Clear all settings saved for a guild.', 
            examples: [ 'clear' ],
            guildOnly: true,
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'sureness',
                    prompt: oneLine`Are you sure you want to do clear all
                    saved settings for your guild? (y/N)`,
                    type: 'string',
                    oneOf: [
                        'y',
                        'Y',
                        'n',
                        'N'
                    ]
                }
            ]
        })
    }

    async run( msg, { sureness } ) {
        sureness =
        sureness == 'Y' ||
        sureness == 'y'

        if( sureness ) {
            this.client.settings.clear()
            .then( msg.channel.send( `Settings for guild ${msg.guild.name} cleared.` ) )
        } else {
            return msg.channel.send( 'Exiting.' )
        }
    }
}