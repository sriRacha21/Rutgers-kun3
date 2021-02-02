const Commando = require('discord.js-commando');
const bent = require('bent');
const getJSON = bent('json');

module.exports = class MeowCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'meow',
            aliases: ['cat', 'kitty'],
            group: 'fun',
            memberName: 'meow',
            description: 'Cute kitty.',
            details: 'Output a picture of a cute kitty chosen at random.',
            throttling: {
                usages: 1,
                duration: 3
            }
        });
    }

    async run( msg ) {
        msg.channel.startTyping();
        const url = 'https://api.thecatapi.com/v1/images/search';
        getJSON(url)
            .then( res => {
                msg.reply({ files: [res[0].url] });
            })
            .catch(err => msg.reply( `There was an error: ${err}`))
            .finally(() => msg.channel.stopTyping());
    }
};
