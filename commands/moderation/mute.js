const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { startTimedMute } = require('../../helpers/startTimedMute')
const prettyMilliseconds = require('pretty-ms')

module.exports = class MuteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'mute',
            group: 'moderation',
            memberName: 'mute',
            description: 'Mute a user.',
            guildOnly: true,
            userPermissions: [ defaults.moderator_permission ],
            args: [
                {
                    key: 'member',
                    label: 'user',
                    prompt: 'Enter the user you want to mute.',
                    type: 'member',
                },
                {
                    key: 'time',
                    prompt: 'Enter the amount of time you want to mute the user for with numbers followed by <w/d/h/m/s>.',
                    type: 'time',
                },
                {
                    key: 'reason',
                    prompt: 'Enter the reason you want to mute the user.',
                    type: 'string',
                    default: 'none',
                }
            ]
        })
    }

    async run( msg, {member, time, reason} ) {
        // don't let a user mute the bot
        if( member.user.id == this.client.user.id ) {
            const maybeEmote = this.client.emojis.find(emoji => emoji.name == 'WeirdChamp')
            if( maybeEmote )
                msg.react( maybeEmote )
            else
                msg.channel.send( 'Nice try!' )
            return
        }

        // don't let a user mute someone with a higher or equal role than them
        if( msg.member.highestRole.position <= member.highestRole.position )
            return msg.channel.send( 'You cannot mute users with a role equal to or higher than yours.' )

        // don't run if there is no muted role
        if( !this.client.provider.get( msg.guild, 'muteRole' ) )
            return msg.channel.send( 'There needs to be a muted role set to mute a user. Set one with `!setmuterole`.' )

        // command usage response
        msg.channel.send( `${member} has been muted for ${prettyMilliseconds(time)}.` )
        // assign muted role to user and remove it after a certain amount of time
        startTimedMute( member, this.client.provider, reason == 'none' ? null : reason, time )
    }
}