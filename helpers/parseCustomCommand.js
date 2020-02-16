function parseCustomCommand( commandName, settings, channel ) {
    const commandInfo = settings.get(channel.guild, `commands:${commandName}`)

    let msgSendPromise
    if( commandInfo ) {
        if( commandInfo.text != '' && commandInfo.attachment )
            msgSendPromise = channel.send( commandInfo.text, {files: [commandInfo.attachment]} )
        else if ( commandInfo.text != '' && !commandInfo.attachment )
            msgSendPromise = channel.send( commandInfo.text )
        else if( commandInfo.text == '' && commandInfo.attachment )
            msgSendPromise = channel.send( {files: [commandInfo.attachment]} )
        else
            throw 'Illegal arguments for parseCustomCommand'
    }
    if( msgSendPromise )
        msgSendPromise.then( msg => msg.react('🔧') )
}

exports.parseCustomCommand = parseCustomCommand