const Commando = require('discord.js-commando')

module.exports = class LeaveCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'soundboard',
            memberName: 'leave',
            description: 'Make the bot leave a voice channel.'
        })
    }

    async run( msg, args ) {
        if( !msg.guild.me.voiceChannel )
            return msg.reply( 'I am not in a voice channel.' )

        msg.guild.me.voiceChannel.leave()
        msg.react( '👋' )
    }
}