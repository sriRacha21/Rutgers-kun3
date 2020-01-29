const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class ConfigCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'config',
            group: 'settings',
            memberName: 'config',
            description: 'Configure values that are needed for some functions of the bot.',
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'approvalChannel',
                    label: 'approval channel',
                    prompt: 'Enter the channel you would like to set as the approval channel.',
                    type: 'channel'
                }
            ]
        })
    }

    async run( msg, args ) {
        msg.channel.send( `Work in progress` )
    }
}