async function loadingEdit( channel, emojis, newContent, contentOptions ) {
    channel.startTyping();
    if ( newContent && contentOptions ) { channel.send( newContent, contentOptions ); } else if ( newContent && !contentOptions ) { channel.send( newContent ); } else if ( !newContent && contentOptions ) { channel.send( contentOptions ); }
    channel.stopTyping();
}

exports.loadingEdit = loadingEdit;
