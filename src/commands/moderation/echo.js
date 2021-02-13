const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

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
                    label: 'channel or member',
                    prompt: 'Enter the name of the channel or user you want to echo into.',
                    type: 'channel|member'
                },
                {
                    key: 'message',
                    prompt: 'Enter the message you want to echo into that channel.',
                    type: 'string'
                }
            ]
        });
    }

    async run( msg, { channel, message } ) {
        let messageToSend = '';
        if ( channel.user ) {
            messageToSend += `You have been sent a message by the moderators of **${msg.guild.name}**:

`;
        } // this is a user object

        messageToSend += message;
        channel.send( messageToSend, { disableMentions: channel.type === 'dm' ? 'none' : 'all' } )
            .then( msg.react( '👍' ) );
    }
};
