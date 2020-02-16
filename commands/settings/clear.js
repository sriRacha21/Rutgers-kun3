const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { oneLine } = require('common-tags');

module.exports = class ClearSettingsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'clear-settings',
            group: 'settings',
            memberName: 'clear',
            description: 'Clear all settings saved for a guild.', 
            examples: [ 'clear' ],
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'sureness',
                    prompt: oneLine`Are you sure you want to clear all
                    saved settings for your guild? (y/N)`,
                    type: 'string',
                    oneOf: [
                        'y',
                        'Y',
                        'n',
                        'N'
                    ]
                },
                {
                    key: 'guild',
                    prompt: 'Do you want to remove the setting for this guild?',
                    type: 'boolean',
                }
            ],
            argsPromptLimit: 1,
            ownerOnly: true,
        })
    }

    async run( msg, { sureness, guild } ) {
        sureness =
        sureness == 'Y' ||
        sureness == 'y'

        if( sureness ) {
            (guild ? this.client.provider.clear(msg.guild) : this.client.settings.clear())
            .then( msg.channel.send( `Settings ${ guild ? `for guild ${msg.guild.name} ` : '' }cleared.` ) )
        } else {
            return msg.channel.send( 'Exiting.' )
        }
    }
}