function setLiveRole( oldM, newM, settings ) {
    // SHOCKINGLY this doesn't work if you use a custom status. Crazy.
    
    // stop if there is no live role in this server
    const liveRoleID = settings.get( oldM.guild, `liveRole` )
    if( !liveRoleID )
        return
    
    const oldMisStreaming = oldM.presence.game && oldM.presence.game.streaming
    const newMisStreaming = newM.presence.game && newM.presence.game.streaming
    // check if the user went from not streaming to streaming
    if( !oldMisStreaming && newMisStreaming )
        newM.addRole( liveRoleID )
    // check if the user went from streaming to not streaming
    if( oldMisStreaming && newMisStreaming )
        newM.removeRole( liveRoleID )
}


exports.setLiveRole = setLiveRole