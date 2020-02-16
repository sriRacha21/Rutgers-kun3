const Commando = require('discord.js-commando')

module.exports = class StopCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'stop',
            group: 'soundboard',
            memberName: 'stop',
            description: 'Stop playing a sound in the voice channel.',
            guildOnly: true,
        })
    }


    async run( msg ) {
        const connection = this.client.voiceConnections.get( msg.guild.id )
        if( !connection )
            msg.channel.send( 'I am not connected to a voice channel in this server.' )
        if( msg.member.voiceChannelID != connection.channel.id )
            msg.channel.send( 'You can only use this if you are in the same channel as the bot in this server.' )
        connection.playFile('')
        msg.react( '😢' )
	}
}