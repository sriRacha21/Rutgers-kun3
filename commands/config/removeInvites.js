const Commando = require('discord.js-commando')

module.exports = class RemoveInvitesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'toggleremoveinvites',
            group: 'config',
            memberName: 'removeinvites',
            description: 'Set up the bot to remove server invite links. Automatically excludes some servers by default.',
        })
    }


    async run( msg ) {
        const settings = this.client.provider

        if( !settings.get( msg.guild, `removeInvites`) ) {
            settings.set( msg.guild, `removeInvites`, true )
            msg.channel.send( 'Remove invites setting turned on.' )
        } else {
            settings.remove( msg.guild, `removeInvites` )
            msg.channel.send( 'Remove invites setting turned off.' )
        }
	}
}