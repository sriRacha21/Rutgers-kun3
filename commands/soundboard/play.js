const Commando = require('discord.js-commando')
const path = require('path')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class PlayCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'play',
            group: 'soundboard',
            memberName: 'play',
            description: "Play a sound from the bot's soundboard.",
            guildOnly: true,
            args: [
                {
                    key: 'filename',
                    type: 'string',
                    prompt: '',
                    validate: str => str.match(/[a-z]|[A-Z]|[0-9]+/),
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptlimit: 1,
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
            msg.react( '👏' )
            connection.playFile(path.join(process.cwd(), 'sounds', `${args.filename}.mp3`))
        })
        .catch( console.error )
    }
}