const prettyMilliseconds = require('pretty-ms')

function startTimedMute( member, settings, reason, expirationTime ) {
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
            member.addRole( permissionRole )
        member.removeRole( muteRole )
    }
}

exports.startTimedMute = startTimedMute