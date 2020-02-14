const { generateDefaultEmbed } = require('./generateDefaultEmbed')

function logEvent( logInfo ) {
    // get fields
    const embedInfo = logInfo.embedInfo
    const guild = logInfo.guild
    const settings = logInfo.settings
    const attachments = logInfo.attachments ? logInfo.attachments : []
    // exit if there is no guild
    if( !guild )
        return
    // exit if there is no log channel for the guild
    const logChannelID = settings.get( guild, `logChannel` )
    if( !logChannelID )
        return
    // set log channel
    const logChannel = guild.channels.find( c => c.id == logChannelID )
    // get default embed
    const embed = generateDefaultEmbed( embedInfo ) 
    // send message to channel
    logChannel.send( embed )
    if( attachments.length > 0 )
        logChannel.send({ files: attachments })
}

exports.logEvent = logEvent