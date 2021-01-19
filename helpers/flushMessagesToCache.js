const fs = require('fs')
const logger = require('../logger')

function flushMessagesToCache( channels, provider ) {
    logger.log('info', `Running microtask flushMessagesToCache.`);
    // check for default settings
    const channelMessages = provider.get('messagesToCache');
    if(!channelMessages) return;

    channelMessages.forEach(async channelMessage => {
        // malformed object
        if( !channelMessage.channel || !channelMessage.message ) return;
        const channelID = channelMessage.channel;
        const messageID = channelMessage.message;
        const channel = channels.resolve(channelID);
        // unable to find channel
        if( !channel || channel.type!='text' ) {
            removeEntry(channelID, messageID, provider);
            return;
        }
        let message;
        try {
            message = await channel.messages.fetch(messageID);
        } catch(err) {
            return;
        }
        if(!message) removeEntry(channelID, messageID, provider);
    });
}

function removeEntry(channelID, messageID, provider) {
    const channelMessages = provider.get('messagesToCache');
    const newMTC = [];
    channelMessages.forEach(elem => {
        if(elem.channel != channelID && elem.message != messageID)
            newMTC.push(elem);
    })
    if(newMTC.length != channelMessages.length) {
        provider.set('messagesToCache', newMTC);
        logger.log('info', `Successfully removed ${channelID}:${messageID} from messagesToCache array.`);
    }
}

exports.flushMessagesToCache = flushMessagesToCache;
