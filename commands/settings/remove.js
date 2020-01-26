const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
const util = require('util')

module.exports = class RemoveSettingCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'remove-setting',
            group: 'settings',
            memberName: 'remove',
            description: 'Remove a setting in the settings provider for this guild in the CommandoClient.',
            examples: [ 'settings:remove key', 'remove-guild-settings approvalChannel' ],
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'key',
                    prompt: 'Enter the key for the setting you want to remove.',
                    type: 'string'
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
    
    async run( msg, { key, guild } ) {
        const valPromise = guild ? this.client.provider.remove( msg.guild, key ) : this.client.settings.remove( key )
        
        if( valPromise )
            valPromise.then( value => msg.channel.send( `Removed value by key, \`${key}\`, from settings.` ) )
            .catch( e => msg.channel.send(`Could not remove value by key, \`${key}\`, from settings: ${e}`) )
        else
            msg.channel.send(`Could not remove value by key, \`${key}\`, from settings.`)
    }
}