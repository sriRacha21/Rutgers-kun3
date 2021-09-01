const { generateDefaultEmbed } = require('./generateDefaultEmbed');
const logger = require('../logger');

function logEvent( logInfo, extras ) {
    // get fields
    const embedInfo = logInfo.embedInfo;
    const guild = logInfo.guild;
    const settings = logInfo.settings;
    let channel = logInfo.channel;
    const attachments = logInfo.attachments ? logInfo.attachments : [];
    const timestamp = logInfo.timestamp;
    // exit if there is no guild
    if ( !guild ) { return; }
    // exit if there is no log channel for the guild
    const logChannelID = settings.get( guild, 'logChannel' );
    if ( !logChannelID ) { return; }
    // set log channel
    if ( !channel ) { channel = guild.channels.resolve(logChannelID); }
    if ( !channel ) {
        logger.log('warn', `The log channel could not be found in guild ${guild.name}.`);
        if (guild.owner) guild.owner.send(`The log channel could not be found in your guild, **${guild.name}**. Use \`${guild.commandPrefix}setlogchannel\` in your server to set this.`);
        return;
    }
    // get default embed
    const embed = generateDefaultEmbed( embedInfo );
    if (timestamp) { embed.setTimestamp(timestamp); }
    // send message to channel
    channel.send( embed );
    if ( attachments.length > 0 ) { channel.send({ files: attachments }); }
    if ( extras ) {
        extras.forEach(extra => {
            if (extra.length <= 2000) {
                channel.send( extra, {
                    disableMentions: 'all',
                    split: true
                });
            } else { channel.send('Text too long.'); }
        });
    }
}

exports.logEvent = logEvent;
