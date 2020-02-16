const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetProtectedRolesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setprotectedroles',
            group: 'config',
            memberName: 'protectedroles',
            description: 'Configure roles that a user will need approval to add.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'protectedRoles',
                    label: 'protected roles',
                    prompt: 'Enter the roles you want users to be approved for. Enter `clear` then `finish` to reset the setting.',
                    type: 'role|string',
                    infinite: true
                }
            ]
        })
    }

    async run( msg, { protectedRoles } ) {
        const settings = this.client.provider

        if( protectedRoles[0] === 'clear' ) {
            settings.remove( msg.guild, `protectedRoles` )
            .then( msg.channel.send(`Protected roles successfully cleared.`) )
            return
        }

        if( !settings.get( msg.guild, `approvalChannel` ) )
            return msg.channel.send( `You need to designate an approval channel with \`${msg.guild.commandPrefix}setapprovalchannel\` first.`)

        // perform input validation on every maybe role
        let error
        protectedRoles.forEach( protectedRole => {
            if( typeof protectedRole == 'string' )
                error = `Invalid input. Please try again.`
            const agreementRoles = settings.get( msg.guild, `agreementRoles` )
            if( agreementRoles && agreementRoles.map(r => r.roleID).includes(protectedRole.id) )
                error = 'You may not make an agreement role one of the protected roles.'
        })
        if( error )
            return msg.channel.send( error )

        // now that we've performed all the validation we need to we can set the setting to the roles
        settings.set( msg.guild, `protectedRoles`, protectedRoles.map(r => r.id) )
        .then( msg.channel.send(`Protected roles successfully set.`) )
	}
}