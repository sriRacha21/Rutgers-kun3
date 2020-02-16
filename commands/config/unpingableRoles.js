const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetUnpingableRolesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setunpingableroles',
            group: 'config',
            memberName: 'unpingableroles',
            description: 'Configure the roles that users without the \`Mention Everyone\` permission will get muted upon mentioning.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'roles',
                    prompt: 'Enter the roles you want to have members muted for mentioning. Enter `all-roles` then `finish` to add all mentionable roles. Simply enter `clear` then `finish` to clear the setting.',
                    type: 'role|string',
                    infinite: true
                }
            ],
        })
    }


    async run( msg, { roles } ) {
        const settings = this.client.provider

        // console.log( roles[0] )

        if( roles[0] === 'clear' ) {
            settings.remove( msg.guild, `unpingableRoles` )
            .then( msg.channel.send(`Unpingable roles successfully cleared.`) )
            return
        }

        if( roles[0] === 'all-roles' ) {
            const unpingableRoles = msg.guild.roles.filter(r => r.mentionable).map(r => r.id)
            settings.set( msg.guild, `unpingableRoles`, unpingableRoles )
            .then( msg.channel.send( `Unpingable roles successfully set to all mentionable roles in this guild.` ) )
            return
        }

        if( !settings.get( msg.guild, `muteRole` ) )
            return msg.channel.send( `You need to designate a muted role with \`${msg.guild.commandPrefix}setmuterole\` first.` )

        if( !!roles.find(r => !r.mentionable) )
            return msg.channel.send( `All arguments must be roles and all roles must be mentionable.` )
        
        settings.set( msg.guild, `unpingableRoles`, roles.map(r => r.id) )
        .then( msg.channel.send( `Unpingable roles successfully set.` ) )
	}
}