const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
const util = require('util')

module.exports = class GetSettingCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'get-guild-setting',
            group: 'settings',
            memberName: 'get',
            description: 'Get a setting in the settings provider for this guild in the CommandoClient.',
            examples: [ 'settings:get key', 'get-guild-setting approvalChannel' ],
            guildOnly: true,
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'key',
                    prompt: 'Enter the key for the setting you wan tot retrieve.',
                    type: 'string'
                }
            ],
            argsPromptLimit: 1,
        })
    }
    
    async run( msg, { key } ) {
        const value = this.client.settings.get( key )

        return msg.channel.send( value ? 'Value: ```' + util.inspect(value) + '\n```' : `Could not get value by key, \`${key}\`, from settings.` )
    }
}