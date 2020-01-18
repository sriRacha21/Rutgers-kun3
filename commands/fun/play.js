const Commando = require('discord.js-commando')

module.exports = class PlayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'fun',
            memberName: 'play',
            description: "Play a sound from the bot's soundboard.",
            details: 'Available sounds: ',
            args: [
                {
                    key: 'filename',
                    type: 'string',
                    prompt: 'Enter the name of a sound file. Available sounds are:',
                }
            ]
        })
    }

    async run( msg, args ) {
        // Check if user is typing in text channel in server, if not reply
        if( !msg.member )
            return msg.reply( 'You must run this in a server and connected to a voice channel.' )
        // Check if user is in voice channel, if not reply
        if( !msg.member.voiceChannel )
            return msg.reply( 'You must join a voice channel first.' )
        
        // otherwise join the voice channel and play a file
        msg.member.voiceChannel.join()
        .then( connection => {
            connection.playFile('sounds/doriyah.mp3')
        })
        .catch( console.log )
    }
}