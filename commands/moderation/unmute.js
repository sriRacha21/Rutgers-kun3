const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { startTimedMute } = require('../../helpers/startTimedMute')

module.exports = class UnmuteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'unmute',
            group:'moderation',
            memberName: 'unmute',
            description: 'Unmute a user.',
            guildOnly: true,
            userPermission: [ defaults.moderator_permission ],
            args: [
                {
                    key: 'member',
                    label: 'user',
                    prompt: 'Enter the user you want to unmute.',
                    type: 'member',
                }
            ]
        })
    }

    async run( msg, { member } ) {
        // don't let a user unmute someone with a higher or equal role than them
        if( msg.member.highestRole.position <= member.highestRole.position )
            return msg.channel.send( 'You cannot mute users with a role equal to or higher than yours.' )

        // check for muted role
        const muteRoleID = this.client.provider.get( msg.guild, `muteRole` )
        const muteRole = member.roles.find( r => r.id == muteRoleID )
        if( !member.roles.find( r => r.id == muteRoleID ) )
            return msg.channel.send( `This user is not muted.` )

        // get permission role if it exists
        const maybeAgreementRoles = this.client.provider.get( msg.guild, `agreementRoles` )
        let permissionRole = null
        if( maybeAgreementRoles ) {
            const permissionRoleID = maybeAgreementRoles.find( r => r.authenticate === 'permission' )
            if( permissionRoleID )
                permissionRole = msg.guild.roles.find( r => r.id == permissionRoleID )
        }
        
        // command usage response
        msg.channel.send( `${member} has been unmuted.` )
        // remove and add roles appropriately
        startTimedMute( member, muteRole, permissionRole )
    }
}