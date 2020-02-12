const prettyMilliseconds = require('pretty-ms')

function startTimedMute( member, muteRole, permissionRole, reason, expirationTime ) {
    if( reason == 'none' )
        reason = null
    
    if( expirationTime ) {
        // notify the user
        member.user.send( `You have been muted for ${prettyMilliseconds(expirationTime)} in server ${member.guild.name}.${reason ? ` Reason: \`${reason}\`.` : ``}` )
        // assign roles and start the timers
        member.addRole( muteRole )
        if( permissionRole && member.roles.find(r => r.id == permissionRole.id) )
            member.removeRole( permissionRole )
        setTimeout(() => {
            startTimedMute(member, muteRole, permissionRole)
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