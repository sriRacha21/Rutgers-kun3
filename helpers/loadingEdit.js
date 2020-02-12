async function loadingEdit( channel, emojis, newContent, contentOptions ) {
    const loadingEmoji = emojis.find( e => e.name && e.name == 'loading' )
    const editMessage = await channel.send( `Loading... ${loadingEmoji ? loadingEmoji : ``}` )
    if( newContent && contentOptions ) {
        editMessage.delete()
        channel.send( newContent, contentOptions )
    }
    else if( newContent && !contentOptions )
        editMessage.edit( newContent )
    else if( !newContent && contentOptions ) {
        editMessage.delete()
        channel.send( contentOptions )
    }
}

exports.loadingEdit = loadingEdit