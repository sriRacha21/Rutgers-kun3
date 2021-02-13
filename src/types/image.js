const Commando = require('discord.js-commando');

class ImageArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'image'); }

    isEmpty( _, __, ___, currentMessage ) {
        const result = currentMessage.attachments.size === 0;
        return result;
    }

    validate( _, __, ___, currentMessage ) {
        const filename = currentMessage.attachments.first().name;
        const endsWithValid = filename.endsWith('.png') ||
        filename.endsWith('.gif') ||
        filename.endsWith('.jpg') ||
        filename.endsWith('.jpeg');
        const result = currentMessage.attachments.first() && endsWithValid;
        return result;
    }

    parse( _, __, ___, currentMessage ) {
        const result = currentMessage.attachments.first();
        return result;
    }
}

module.exports = ImageArgumentType;
