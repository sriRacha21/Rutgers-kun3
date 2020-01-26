function parseCustomCommand( commandName, settings, channel ) {
    const commandInfo = settings.get(channel.guild, `commands:${commandName}`)

    if( commandInfo )
        channel.send( commandInfo.text )
        .then( msg => msg.react('🔧') )
}

exports.parseCustomCommand = parseCustomCommand