function sendRoleResponse( oldM, newM, settings ) {
    console.log("send role response fired");
    // if there is a change in roles
    if( !oldM.roles.equals( newM.roles ) ) {
        console.log("old roles not same as new roles")
        const role = newM.roles.find( newR => !oldM.roles.array().includes(newR) )
        if( role ) {
            console.log("role found");
            // check if role ID exists in settings
            const phrase = settings.get( oldM.guild, `roleResponse:${role.id}` )
            if( phrase ) {
                console.log("phrase found");
                newM.user.send( phrase )
            }
        }
    }
}


exports.sendRoleResponse = sendRoleResponse