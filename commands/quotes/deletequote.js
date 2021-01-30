const Commando = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class DeleteQuoteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'deletequote',
            aliases: [ 'deletequotes' ],
            group: 'quotes',
            memberName: 'delete',
            description: 'Delete your own quotes.',
            examples: [
                'deletequote',
                'deletequote 9',
                'deletequotes 7 8 9'
            ],
            args: [
                {
                    key: 'indices',
                    label: 'quote index',
                    prompt: oneLine`Enter the index of the quote you want to delete.
(given by \`${client.commandPrefix}quotes\`) I'll keep asking for input in case you want to delete multiple quotes.`,
                    type: 'integer',
                    min: 1,
                    max: 25,
                    infinite: true
                }
            ]
        });
    }

    async run( msg, { indices } ) {
        // get all the quotes
        let quotes = this.client.settings.get( `quotes:${msg.author.id}` );

        // move all indices down one since arrays are zero-indexed
        const zeroBasedIndices = indices
            .map( index => index - 1 )
            .filter( index => index < quotes.length );

        // make sure we're going to output the quotes that were actually deleted
        indices = zeroBasedIndices.map( index => index + 1 );

        // set the quotes we don't want to null, don't just instantly remove them so we can do this in-place
        zeroBasedIndices.forEach(( index ) => {
            quotes[index] = null;
        });

        // remove the quotes with the null index
        quotes = quotes.filter( quote => quote != null );

        // set quotes back
        this.client.settings.set( `quotes:${msg.author.id}`, quotes )
            .then( msg.channel.send(indices.length > 0
                ? `Successfully removed quotes ${indices.join(', ')}.`
                : 'Failed to remove quotes.') );
    }
};
