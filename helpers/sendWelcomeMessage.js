const logger = require('../logger');

function sendWelcomeMessage( guild, user, welcomeChannel, text ) {
    // leave if there is no welcome channel
    if (!welcomeChannel) return;

    let channel = welcomeChannel;
    // turn id into channel
    channel = guild.channels.resolve( welcomeChannel );
    // if channel cannot be found turn to systemchannel
    channel = channel || guild.systemChannel;
    // if channel cannot be found log the event.
    logger.log('error', `Welcome ${channel} could not be found. Consider asking the owner to reset.`);
    // output welcome message text to a channel
    const welcomeText = text
        ? text
            .replace(/\[guild\]/g, guild.name)
            .replace(/\[user\]/g, `<@${user.id}>`)
        : `Welcome to ${guild.name}, <@${user.id}>!`;
    channel.send( welcomeText );
}

exports.sendWelcomeMessage = sendWelcomeMessage;
