function sendRoleResponse( oldM, newM, settings ) {
    // if there is a change in roles
    if( !oldM.roles.equals( newM.roles ) ) {
        const role = newM.roles.find( newR => !oldM.roles.array().includes(newR) )
        if( role ) {
            // check if role ID exists in settings
            const phrase = settings.get( oldM.guild, `roleResponse:${role.id}` )
            if( phrase )
                newM.user.send( phrase )
        }
    }
}


exports.sendRoleResponse = sendRoleResponse