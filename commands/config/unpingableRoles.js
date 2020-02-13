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
            args: [
                {
                    key: 'roles',
                    prompt: 'Enter the roles you want to have members muted for mentioning. Simply enter `clear` then `finish` to clear the setting.',
                    type: 'role|string',
                    infinite: true
                }
            ],
        })
    }


    async run( msg, { roles } ) {
        const settings = this.client.provider

        if( roles[0] === 'clear' ) 
            return settings.remove( msg.guild, `unpingableRoles` )
            .then( msg.channel.send(`Unpingable roles successfully cleared.`) )

        if( !settings.get( msg.guild, `muteRole` ) )
            return msg.channel.send( `You need to designate a muted role with \`!setmuterole\` first.` )

        if( !!roles.find(r => !r.mentionable) )
            return msg.channel.send( `All roles must be mentionable.` )
        
        return settings.set( msg.guild, `unpingableRoles`, roles.map(r => r.id) )
        .then( msg.channel.send( `Unpingable roles successfully set.` ) )
	}
}