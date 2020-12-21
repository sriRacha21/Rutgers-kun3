const prettyMilliseconds = require('pretty-ms')
const { logEvent } = require('./logEvent')
const RichEmbed = require('discord.js').RichEmbed

function startTimedMute( member, settings, reason, expirationTime, clientUser ) {
    // get muted role
    const muteRoleID = settings.get( member.guild, 'muteRole' )
    if( !muteRoleID )
        return
    const muteRole = member.guild.roles.find( role => role.id == muteRoleID )
    // get permission role if it exists
    const maybeAgreementRoles = settings.get( member.guild, `agreementRoles` )
    let permissionRole = null
    if( maybeAgreementRoles ) {
        const permissionRoleObj = maybeAgreementRoles.find( r => r.authenticate === 'permission' )
        if( permissionRoleObj )
            permissionRole = member.guild.roles.find( r => r.id == permissionRoleObj.roleID )
    }
    
    if( expirationTime ) {
        // notify the user
        member.user.send( `You have been muted for ${prettyMilliseconds(expirationTime)} in server ${member.guild.name}.${reason ? ` Reason: \`${reason}\`.` : ``}` )
        // log it in the mod channel if it exists
        const modChannelID = settings.get( member.guild, 'modChannel' )
        if( modChannelID ) {
            const modChannel = member.guild.channels.find(c => c.id == modChannelID)
            const startEmbed = new RichEmbed()
            if( reason )
                startEmbed.addField('Reason:', reason)
            startEmbed.addField('Duration:', prettyMilliseconds(expirationTime))
            logEvent({
                embedInfo: {
                    author: 'Muted user',
                    title: member.user.tag,
                    clientUser: clientUser,
                    guild: member.guild,
                    thumbnail: member.user.displayAvatarURL,
                    startingEmbed: startEmbed
                },
                guild: member.guild,
                settings: settings,
                channel: modChannel
            })
        }
        // assign roles and start the timers
        member.addRole( muteRole )
        if( permissionRole && member.roles.find(r => r.id == permissionRole.id) )
            member.removeRole( permissionRole )
        setTimeout(() => {
            startTimedMute(member, settings)
        }, expirationTime)
    } else {
        // notify the user
        member.user.send( `You have been unmuted in server ${member.guild.name}.` )
        if( permissionRole )
            member.addRole( permissionRole );
        member.removeRole( muteRole );
    }
}

exports.startTimedMute = startTimedMute