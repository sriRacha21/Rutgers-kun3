const Commando = require('discord.js-commando');

module.exports = class LeaveCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'leave',
            group: 'soundboard',
            memberName: 'leave',
            description: 'Make the bot leave a voice channel.',
            guildOnly: true
        });
    }

    async run( msg, args ) {
        if ( !msg.guild.me.voice.channel ) { return msg.reply( 'I am not in a voice channel.' ); }

        msg.guild.me.voice.channel.leave();
        msg.react( '👋' );
    }
};
