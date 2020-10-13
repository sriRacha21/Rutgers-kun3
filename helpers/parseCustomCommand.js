function parseCustomCommand( commandName, appends, settings, channel ) {
    const commandInfo = settings.get(channel.guild, `commands:${commandName}`)

    let msgSendPromise;
    if( commandInfo ) {
        let cText = commandInfo.text;
        // do full replacement for braces with space
        if( cText.includes('{ }') ) {
            cText = cText.replace('{ }', appends.join(' '));
            appends = [];
        }
        // do replacements for custom arguments
        while( cText.includes('{}') && appends.length > 0 )
            cText = cText.replace('{}', appends.shift() );
        
        const text = (cText + ' ' + appends.join(' ')).trim();

        if( text != '' && commandInfo.attachment )
            msgSendPromise = channel.send( text, {files: [commandInfo.attachment]} );
        else if ( text != '' && !commandInfo.attachment )
            msgSendPromise = channel.send( text );
        else if( text == '' && commandInfo.attachment )
            msgSendPromise = channel.send( {files: [commandInfo.attachment]} );
        else
            throw 'Illegal arguments for parseCustomCommand';
    }
    if( msgSendPromise )
        msgSendPromise.then( msg => msg.react('🔧') );
}

exports.parseCustomCommand = parseCustomCommand;