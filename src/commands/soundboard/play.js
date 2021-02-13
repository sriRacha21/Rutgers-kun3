const Commando = require('discord.js-commando');
const path = require('path');
const { getSoundsArr } = require('../../helpers/sounds');

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
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptlimit: 1
        });
    }

    async run( msg, { filename } ) {
        const settings = this.client.provider;
        // Check if user is typing in text channel in server, if not reply
        if ( !msg.member ) { return msg.channel.send( 'You must run this in a server and connected to a voice channel.' ); }
        // Check if user is in voice channel, if not reply
        if ( !msg.member.voice.channel ) { return msg.channel.send( 'You must join a voice channel first.' ); }
        if ( !getSoundsArr().includes(filename) ) { return msg.channel.send( `That is not a valid sound file. Make sure to pick one from the list (\`${msg.guild.commandPrefix}sounds\`)` ); }

        // get volume
        const volume = settings.get( msg.guild, 'volume' );

        // otherwise join the voice channel and play a file
        msg.member.voice.channel.join()
            .then( connection => {
                msg.react( '👏' );
                const volumePlaying = volume ? volume / 100 : 0.2;
                connection.play(path.join(process.cwd(), 'sounds', `${filename}.mp3`), { volume: volumePlaying });
            })
            .catch( console.error );
    }
};
