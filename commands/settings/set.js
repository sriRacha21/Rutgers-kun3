const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))

module.exports = class SetSettingCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'set-guild-setting',
            group: 'settings',
            memberName: 'set',
            description: 'Set a setting in the settings provider for this guild in the CommandoClient.',
            examples: [ 'set key value', 'set approvalChannel 207366492579168257' ],
            guildOnly: true,
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'key',
                    prompt: 'Enter the key for the setting.',
                    type: 'string'
                },
                {
                    key: 'value',
                    prompt: 'Enter the value for the setting.',
                    type: 'string'
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { key, value } ) {
        this.client.settings.set( key, value )
        .then( msg.channel.send(`Setting has been successfully set for guild ${msg.guild.name}.
\`\`\`key: ${key}\nvalue: ${value}\`\`\``) )
    }
}