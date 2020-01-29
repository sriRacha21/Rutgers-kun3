const Commando = require('discord.js-commando')
const { implementApprovalPolicy } = require('../../helpers/implementApprovalPolicy')
const RichEmbed = require('discord.js').RichEmbed;

module.exports = class AddCommandCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addcommand',
            group: 'customcommands',
            memberName: 'add',
            description: 'Add a custom command to the bot.',
            details: 'Attachments to the message calling the command will be attached to subsequent calls of the custom command.',
            guildOnly: true,
            examples: [
                `addcommand`,
                `addcommand commandname example command text`,
                `customcommands:add whenarjuntypes :Pog:`
            ],
            args: [
                {
                    key: 'name',
                    label: 'command name',
                    prompt: 'Enter the name of the command you want to create.',
                    type: 'string',
                    error: 'You provided an invalid command name. Command names cannot contain spaces.',
                    validate: str => !str.includes(' '), //command name can't have a space
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'text',
                    label: 'command text',
                    prompt: 'Enter the text you want the command to output.',
                    type: 'string',
                },
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { name, text } ) {
        implementApprovalPolicy(
            {
                type: 'command',
                submissionName: `${msg.guild.commandPrefix}${name}`,
                member: msg.member,
                runHasPerms: () => {
                    const settings = this.client.provider

                    settings.set( msg.guild, `commands:${name}`, {
                        text: text,
                        userID: msg.author.id,
                        timestamp: msg.createdAt.toLocaleString(),
                    })
                    .then( msg.react('👍') )
                },
                settings: this.client.provider,
                errChannel: msg.channel
            },
            {
                title: msg.author.tag,
                clientUser: this.client.user,
                msg: msg,
                startingEmbed: new RichEmbed()
                    .addField( 'Command name:', name )
                    .addField( 'Command text:', text )
            }
        )
    }
}
