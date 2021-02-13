const Commando = require('discord.js-commando');

class SoundArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'sound'); }

    isEmpty( _, __, ___, currentMessage ) {
        const result = currentMessage.attachments.size === 0;
        return result;
    }

    validate( _, __, ___, currentMessage ) {
        const result = currentMessage.attachments.first() &&
        currentMessage.attachments.first().name.endsWith('.mp3');
        return result;
    }

    parse( _, __, ___, currentMessage ) {
        const result = currentMessage.attachments.first();
        return result;
    }
}

module.exports = SoundArgumentType;
