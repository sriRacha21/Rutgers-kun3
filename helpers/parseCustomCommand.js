function parseCustomCommand( commandName, guildSettings, channel ) {
    const commandInfo = guildSettings.get(`commands:${commandName}`)

    if( commandInfo )
        channel.send( commandInfo.text )
        .then( msg => msg.react('🔧') )
}

exports.parseCustomCommand = parseCustomCommand