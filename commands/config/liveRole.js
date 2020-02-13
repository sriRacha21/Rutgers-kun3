const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetLiveRoleCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setliverole',
            group: 'config',
            memberName: 'liverole',
            description: 'Configure the role that will be used to hoist guild members who are live on Twitch.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'liveRole',
                    label: 'live role',
                    prompt: `Enter the role you want to designate as the live role. Enter \`clear\` to remove the setting.`,
                    type: 'role|string',
                }
            ],
            argsPromptLimit: 1
        })
    }


    async run( msg, { liveRole } ) {
        const settings = this.client.provider

        if( typeof liveRole === 'object' )
            settings.set( msg.guild, `liveRole`, liveRole.id )
            .then( msg.channel.send( `Live role successfully set as @${liveRole.name}.` ) )
        else if( liveRole == 'clear' ) {
            // don't remove the Live role if there are unpingable roles
            if( settings.get( msg.guild, 'unpingableRoles' ) )
                return msg.channel.send( 'You cannot clear the Live role without clearing unpingable roles first. Run `!setunpingableroles clear` first.' )
            settings.remove( msg.guild, `liveRole` )
            .then( msg.channel.send( `Live role successfully removed.` ) )
        }
        else
            msg.channel.send(`Invalid input. Try again.`)
	}
}