const Commando = require('discord.js-commando')

module.exports = class JoinCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'join',
            group:'soundboard',
            memberName: 'join',
            description: 'Make the bot join a voice channel and do nothing.',
            guildOnly: true,
        })
    }

    async run( msg, args ) {
        // Check if user is typing in text channel in server, if not reply
        if( !msg.member )
            return msg.reply( 'You must run this in a server and connected to a voice channel.' )
        // Check if user is in voice channel, if not reply
        if( !msg.member.voice.channel )
            return msg.reply( 'You must join a voice channel first.' )
        
        msg.member.voice.channel.join()
        .catch( console.log )
        msg.react( '👏' )
    }
}