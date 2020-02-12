const Commando = require('discord.js-commando')

module.exports = class MuteCommnad extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            memberName: 'mute',
            description: 'Mute a user.',
            guildOnly: true,
            args: [
                {
                    key: 'user',
                    prompt: 'Enter the user you want to mute.',
                    type: 'member',
                },
                {
                    key: 'time',
                    prompt: 'Enter the amount of time you want to mute the user for with numbers followed by <w/d/h/m/s>.',
                    type: 'time',
                }
            ]
        })
    }

    async run( msg, {user, time} ) {
        if( user.user.id == this.client.user.id ) {
            const maybeEmote = this.client.emojis.find(emoji => emoji.name == 'WeirdChamp')
            if( maybeEmote )
                msg.react( maybeEmote )
            else
                msg.channel.send( 'Nice try!' )
            return
        }

        // msg.channel.send( `User is ${user}. Time is ${time}.` )
        msg.channel.send( `WIP!` )
    }
}