const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class EchoCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'echo',
            group: 'moderation',
            memberName: 'echo',
            description: 'Echo a message into a channel.',
            userPermissions: [ defaults.moderator_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'Enter the name of the channel or user you want to echo into.',
                    type: 'channel|user'
                },
                {
                    key: 'message',
                    prompt: 'Enter the message you want to echo into that channel.',
                    type: 'string'
                }
            ]
        })
    }

    async run( msg, { channel, message } ) {
        let messageToSend = "";
        if( channel.username ) {
            messageToSend += `You have been sent a message by the moderators of ${msg.guild.name}:

`
        } // this is a user object

        messageToSend += message;
        channel.send( messageToSend )
        .then( msg.react( '👍' ) )
    }
}