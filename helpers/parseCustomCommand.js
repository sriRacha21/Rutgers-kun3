function parseCustomCommand( commandName, appends, settings, channel ) {
    const commandInfo = settings.get(channel.guild, `commands:${commandName}`)

    let msgSendPromise
    if( commandInfo ) {
        const text = (commandInfo.text + ' ' + appends.join(' ')).trim()
        if( text != '' && commandInfo.attachment )
            msgSendPromise = channel.send( text, {files: [commandInfo.attachment]} )
        else if ( text != '' && !commandInfo.attachment )
            msgSendPromise = channel.send( text )
        else if( text == '' && commandInfo.attachment )
            msgSendPromise = channel.send( {files: [commandInfo.attachment]} )
        else
            throw 'Illegal arguments for parseCustomCommand'
    }
    if( msgSendPromise )
        msgSendPromise.then( msg => msg.react('🔧') )
}

exports.parseCustomCommand = parseCustomCommand