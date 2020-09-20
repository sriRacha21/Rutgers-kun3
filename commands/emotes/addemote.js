const Commando = require('discord.js-commando')
const { implementApprovalPolicy } = require('../../helpers/implementApprovalPolicy')
const RichEmbed = require('discord.js').RichEmbed;

module.exports = class AddEmoteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addemote',
            group: 'emotes',
            memberName: 'add',
            description: 'Add an emote to the server.',
            guildOnly: true,
            args: [
                {
                    key: 'name',
                    type: 'string',
                    prompt: 'Set a name for the emote.',
                },
                {
                    key: 'image',
                    label: 'attach image or gif',
                    type: 'image',
                    prompt: 'Attach a static image or gif.'
                }
            ],
            argsPromptLimit: 0,
            throttling: {
                usages: 1,
                duration: 10,
            }
        })
    }

    async run( msg, { name, image } ) {
        implementApprovalPolicy(
            {
                type: 'emote',
                submissionName: `:${name}:`,
                member: msg.member,
                runHasPerms: () => {
                    msg.guild.createEmoji( image.proxyURL, name, null, `Created by ${this.client.user.tag}.` )
                    .then( msg.react('👍') )
                    .catch( e => { if(e) { msg.channel.send(`Emoji ${name} could not be added to the server: \`${e}\``) } })
                },
                settings: this.client.provider,
                attachments: [ image ],
                errChannel: msg.channel
            },
            {
                title: msg.author.tag,
                clientUser: this.client.user,
                msg: msg,
                startingEmbed: new RichEmbed()
                    .addField('Emote name:', `:${name}:`)
            }
        )
    }
}