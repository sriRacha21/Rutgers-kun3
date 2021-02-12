const Commando = require('discord.js-commando');

module.exports = class DeleteWordCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'deleteword',
            aliases: [ 'removeword' ],
            group: 'fun',
            memberName: 'deleteword',
            description: 'Remove a word set by countword.',
            examples: [
                'deleteword zss sux',
                'removeword cya'
            ],
            args: [
                {
                    key: 'word',
                    prompt: 'Enter the word that you don\'t want tracked anymore.',
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { word } ) {
        // get array to check
        const arr = this.client.settings.get( `countword:${msg.author.id}` )
            ? this.client.settings.get( `countword:${msg.author.id}` )
            : [];

        // filter array
        const newArr = arr.filter( wordCountInfo => wordCountInfo.word !== word );

        // return word not being tracked if there's nothing in db or if the array is empty
        if ( arr.length === 0 || arr.length === newArr.length ) { return msg.channel.send( 'This word was not being tracked.' ); }

        this.client.settings.set( `countword:${msg.author.id}`, newArr )
            .then( msg.channel.send( `Successfully removed word \`${word}\` from being tracked.` ) );
    }
};
