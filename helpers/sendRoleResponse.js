function sendRoleResponse( oldM, newM, settings ) {
    // if there is a change in roles
    if( !oldM.roles.cache.equals( newM.roles.cache ) ) {
        const role = newM.roles.cache.find( newR => !oldM.roles.cache.array().includes(newR) );
        if( role ) {
            // check if role ID exists in settings
            const phrase = settings.get( oldM.guild, `roleResponse:${role.id}` );
            if( phrase )
                newM.user.send( phrase );
        }
    }
}

exports.sendRoleResponse = sendRoleResponse;