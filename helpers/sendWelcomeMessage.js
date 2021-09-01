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
    if ( !channel ) {
        logger.log('warn', `Welcome ${channel} could not be found. Consider asking the owner to reset.`);
        guild.owner.send(`The welcome channel could not be found in your guild, **${guild.name}**. Use \`${guild.commandPrefix}setlogchannel\` in your server to set this.`);
        return;
    }
    // output welcome message text to a channel
    const welcomeText = text
        ? text
            .replace(/\[guild\]/g, guild.name)
            .replace(/\[user\]/g, `<@${user.id}>`)
        : `Welcome to ${guild.name}, <@${user.id}>!`;
    channel.send( welcomeText );
}

exports.sendWelcomeMessage = sendWelcomeMessage;
