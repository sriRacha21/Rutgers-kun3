const Commando = require('discord.js-commando');

class GuildArgumentType extends Commando.ArgumentType {
    constructor(client) { super(client, 'guild'); }

    isEmpty( val ) {
        return val === '' || val == null;
    }

    validate( val, msg ) {
        if (!this.client.isOwner(msg.author)) return 'You are not the owner of this bot and cannot use this argument type.';

        const guild = this.parse(val);
        return !!guild;
    }

    parse( val ) {
        const guild = this.client.guilds.cache.find(g => g.name === val || g.id === val);
        return guild;
    }
}

module.exports = GuildArgumentType;
