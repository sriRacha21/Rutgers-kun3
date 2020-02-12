const Commando = require('discord.js-commando')
const util = require('util')

class ImageArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'image') }

    isEmpty( val, msg ) {
        const result = msg.attachments.size == 0
        return result
    }

    validate( val, msg ) {
        const filename = msg.attachments.first().filename
        const endsWithValid = filename.endsWith('.png') 
        || filename.endsWith('.gif') 
        || filename.endsWith('.jpg')
        || filename.endsWith('.jpeg')
        const result = msg.attachments.first() && endsWithValid
        return result
    }

    parse( val, msg ) {
        const result = msg.attachments.first()
        return result
    }
}

module.exports = ImageArgumentType