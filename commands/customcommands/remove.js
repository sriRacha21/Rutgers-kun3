const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'))

module.exports = class RemoveCommandCommands extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'removecommand',
            aliases: [ 'deletecommand' ],
            group: 'customcommands',
            memberName: 'remove',
            description: 'Remove a command from the guild.',
            guildOnly: true,
            examples: [
                'removecommand',
                'removecommand arjun'
            ],
            userPermissions: [ defaults.moderator_permission ],
            args: [
                {
                    key: 'key',
                    prompt: 'Enter the name of the command you want to remove.',
                    type: 'string',
                    error: 'You provided an invalid command name. Command names cannot contain spaces.',
                    validate: str => !str.includes(' '), //command name can't have a space
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptLimit: 1
        })
    }

    async run( msg, { key } ) {
        const result = await this.client.provider.get( msg.guild, `commands:${key}` ) 
        if( !result )
            return msg.channel.send( `No command by the name \`${key}\` was found.` )

        this.client.provider.remove( msg.guild, `commands:${key}` )
        .then( msg.channel.send( `Successfully removed command \`${msg.guild.commandPrefix}${key}\`.`) )
    }
}