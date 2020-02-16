const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class AddUnpingableRoleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addunpingablerole',
            group: 'config',
            memberName: 'addunpingablerole',
            description: 'Add a role to the unpingable roles list.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'role',
                    prompt: 'Enter the role you want to add to the unpingable roles list.',
                    type: 'role',
                }
            ]
        })
    }


    async run( msg, { role } ) {
        const settings = this.client.provider

        const unpingableRoles = settings.get( msg.guild, `unpingableRoles` ) ? settings.get( msg.guild, `unpingableRoles` ) : []

        if( !role.mentionable )
            return msg.channel.send( 'Unpingable roles must be mentionable.' )

        unpingableRoles.push( role.id )

        settings.set( msg.guild, `unpingableRoles`, unpingableRoles )
        .then( msg.channel.send( `Unpingable role successfully added.` ))
	}
}