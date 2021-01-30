const Commando = require('discord.js-commando');
const { timeStrToMillis } = require('../helpers/timeStrToMillis');

class TimeArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'time'); }

    validate( val, msg, arg ) {
        if ( val.includes('.') ) return false; // no decimals allowed!!!

        const millis = timeStrToMillis(val);
        if ( millis > Number.MAX_SAFE_INTEGER || millis < 5000 ) {
            arg.error = 'Time must be greater than or equal to 5 seconds.';
            return false;
        }

        return val.split(' ').reduce( (acc, timePart) => {
            return acc && !!timePart.match(/\d+(?=w|d|h|m|s)/i);
        }, true);
    }

    parse( val, msg ) {
        return timeStrToMillis(val);
    }
}

module.exports = TimeArgumentType;
