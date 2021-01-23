const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class RemoveInvitesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'toggleremoveinvites',
            group: 'config',
            memberName: 'removeinvites',
            description: 'Set up the bot to remove server invite links. Automatically excludes some servers by default.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true
        })
    }


    async run( msg ) {
        const settings = this.client.provider

        // if( !this.client.provider.get( msg.guild, 'muteRole' ) )
        //     return msg.channel.send( 'You need to set up the mute role first.' )

        if( !settings.get( msg.guild, `removeInvites`) ) {
            settings.set( msg.guild, `removeInvites`, true )
            msg.channel.send( 'Remove invites setting turned on.' )
        } else {
            settings.remove( msg.guild, `removeInvites` )
            msg.channel.send( 'Remove invites setting turned off.' )
        }
	}
}
