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
            description: 'Make me toggle ignoring a server member.',
            guildOnly: true,
            userPermissions: [ defaults.moderator_permission ],
            args: [
                {
                    key: 'member',
                    prompt: 'Enter the server member you want me to ignore or unignore.',
                    type: 'member',
                }
            ]
        })
    }


    async run( msg, { member } ) {
        const settings = this.client.provider

        const ignored = settings.get( msg.guild, `ignored:${member.id}` )
        if( ignored )
            settings.remove( msg.guild, `ignored:${member.id}` )
        else 
            settings.set( msg.guild, `ignored:${member.id}`, true )
        
        const modChannelID = settings.get( msg.guild, `modChannel` )
        const modChannel = msg.guild.channels.find(c => c.id == modChannelID)
        if( !ignored && modChannel ) {
            logEvent({
                embedInfo: {
                    author: 'Ignored user',
                    title: member.user.tag,
                    clientUser: this.client.user,
                    guild: msg.guild,
                    thumbnail: member.user.displayAvatarURL,
                },
                guild: member.guild,
                settings: this.client.provider,
                channel: modChannel
            })
        }

        return msg.channel.send( `Successfully ${ignored ? `un` : `` }ignored member ${member.user}.` )
	}
}