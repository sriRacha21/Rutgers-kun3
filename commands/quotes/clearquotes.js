const Commando = require('discord.js-commando');

module.exports = class ClearQuotesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'clearquotes',
            alias: [ 'clearquote' ],
            group: 'quotes',
            memberName: 'clear',
            description: 'Clear your quotes.'
        });
    }

    async run( msg ) {
        this.client.settings.remove(`quotes:${msg.author.id}`)
            .then( msg.reply( 'Your quotes have been successfully cleared.' ) );
    }
};
