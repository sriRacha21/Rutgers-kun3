const Commando = require('discord.js-commando')
const { logEvent } = require('../../helpers/logEvent')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class IgnoreCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'ignore',
            aliases: [ 'unignore' ],
            group: 'moderation',
            memberName: 'ignore',
            description: 'Toggle ignoring a channel.',
            guildOnly: true,
            userPermissions: [ defaults.moderator_permission ],
            args: [
                {
                    key: 'channel',
                    prompt: 'Enter the channel .',
                    type: 'channel',
                }
            ]
        })
    }


    async run( msg, { channel } ) {
        const settings = this.client.provider

        const ignored = settings.get( msg.guild, `ignored:${channel.id}` )
        if( ignored )
            settings.remove( msg.guild, `ignored:${channel.id}` )
        else 
            settings.set( msg.guild, `ignored:${channel.id}`, true )
        
        // const modChannelID = settings.get( msg.guild, `modChannel` )
        // const modChannel = msg.guild.channels.find(c => c.id == modChannelID)
        // if( !ignored && modChannel ) {
        //     logEvent({
        //         embedInfo: {
        //             author: 'Ignored user',
        //             title: member.user.tag,
        //             clientUser: this.client.user,
        //             guild: msg.guild,
        //             thumbnail: member.user.displayAvatarURL,
        //         },
        //         guild: member.guild,
        //         settings: this.client.provider,
        //         channel: modChannel
        //     })
        // }

        return msg.channel.send( `Successfully ${ignored ? `un` : `` }ignored channel ${channel}.` )
	}
}