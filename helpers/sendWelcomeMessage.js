function sendWelcomeMessage( guild, user, welcomeChannel, text ) {
    let channel = welcomeChannel ? welcomeChannel : guild.systemChannel
    if( !channel )
        return
    // turn id into channel
    channel = guild.channels.find( channel => channel.id == welcomeChannel )
    // output welcome message text to a channel
    const welcomeText = text ? text.replace('[guild]', guild.name).replace('[user]', `<@${user.id}>`) : `Welcome, <@${user.id}>, to ${guild.name}!`
    channel.send( welcomeText )
}

exports.sendWelcomeMessage = sendWelcomeMessage