const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class RemoveUnpingableRoleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'removeunpingablerole',
            group: 'config',
            memberName: 'removeunpingablerole',
            description: 'Remove a role from the unpingable roles list.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'Enter the role you want to remove from the unpingable roles list.',
                    type: 'role',
                }
            ]
        })
    }


    async run( msg, { role } ) {
        const settings = this.client.provider

        const unpingableRoles = settings.get( msg.guild, `unpingableRoles` ) ? settings.get( msg.guild, `unpingableRoles` ) : []

        const newUnpingableRoles = unpingableRoles.filter( r => r != role.id )

        const isDifferentArr = unpingableRoles.length != newUnpingableRoles.length

        if( isDifferentArr )
            settings.set( msg.guild, `unpingableRoles`, newUnpingableRoles )
            .then( msg.channel.send( `Unpingable role successfully removed.` ))
        else
            return msg.channel.send( `The role could not be found in the unpingable roles list.` )
	}
}