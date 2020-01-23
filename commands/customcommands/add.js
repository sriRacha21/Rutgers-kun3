const Commando = require('discord.js-commando')

module.exports = class AddCommandCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addcommand',
            group: 'customcommands',
            memberName: 'add',
            description: 'Add a custom command to the bot.',
            details: 'Attachments to the message calling the command will be attached to subsequent calls of the custom command.',
            examples: [
                `addcommand`,
                `addcommand 'commandname' 'example command text'`,
                `customcommands:add 'whenarjuntypes' ':Pog:'`
            ],
            args: [
                {
                    key: 'name',
                    label: 'command name',
                    prompt: 'Enter the name of the command.',
                    type: 'string',
                    error: 'You provided an invalid command name. Command names cannot contain spaces.',
                    validate: str => !str.includes(' '), //command name can't have a space
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'value',
                    label: 'command text',
                    prompt: 'Enter the text you want the command to output.',
                    type: 'string',
                },
            ],
            argsPromptLimit: 1,

        })
    }

    async run( msg, args ) {
        msg.channel.send( "I'm still being worked on!" )
    }
}
