const Commando = require('discord.js-commando')
const util = require('util')

class SoundArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'sound') }

    isEmpty( val, msg ) {
        const result = msg.attachments.size == 0
        return result
    }

    validate( val, msg ) {
        const result = msg.attachments.first() && 
        msg.attachments.first().filename.endsWith('.mp3')
        return result
    }

    parse( val, msg ) {
        const result = msg.attachments.first()
        return result
    }
}

module.exports = SoundArgumentType;