const fs = require('fs')
const defaults = fs.existsSync('settings/default_settings.json') ? JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8')) : {err: true};
const logger = require('../logger')

function flushAgreementEmotes( channels, provider ) {
    logger.log('info', `Running microtask flushAgreementEmotes.`);
    // check for default settings
    if( defaults.err || !defaults.agreementSetupSlimEmote )
        return msg.channel.send("There are no default settings! Add a `default_settings.json` into the settings folder and give it a `agreementSetupSlimEmote` field with the value being the ID for the emote you want to use for the emote reaction.");

    const { agreementSetupSlimEmote } = defaults;

    const channelMessages = provider.get('messagesToCache');

    let nextMicrotask = 3600000;
    if(!channelMessages) {
        logger.log('warn', "No messagesToCache found, running next microtask sooner.");
        nextMicrotask = 15000;
    } else {
        channelMessages.forEach(async channelMessage => {
            // malformed object
            if( !channelMessage.channel || !channelMessage.message ) return;
            const channelID = channelMessage.channel;
            const messageID = channelMessage.message;
            const channel = channels.resolve(channelID);
            // unable to find channel
            if( !channel || channel.type!='text' ) {
                logger.log('warn', `Unable to fetch channel with ID ${channelID}`);
                return;
            }
            let message;
            try {
                message = await channel.messages.fetch(messageID);
            } catch(err) {
                logger.log('warn', `Unable to fetch message with ID ${messageID} in channel ${channelID}`);
                return;
            }
            if(!message) {
                logger.log('warn', `Unable to fetch message with ID ${messageID} in channel ${channelID}`);
                return;
            }
            // message and channel are guaranteed to be filled
            message.reactions.cache.forEach(async mr => {
                await mr.fetch();
                await mr.remove();
                message.react(agreementSetupSlimEmote);
            });
        });
    }

    setTimeout(flushAgreementEmotes, nextMicrotask, channels, provider );
}

exports.flushAgreementEmotes = flushAgreementEmotes;