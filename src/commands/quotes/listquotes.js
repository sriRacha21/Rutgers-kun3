const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class ListQuotesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listquotes',
            aliases: [ 'listquote', 'quotes' ],
            group: 'quotes',
            memberName: 'list',
            description: 'List quotes that have been logged for a user.',
            examples: [
                'quotes',
                'quotes sriracha',
                'quotes <@87525135241728000>'
            ],
            args: [
                {
                    key: 'user',
                    label: 'user',
                    prompt: 'Enter the user whose quotes you want to view.',
                    type: 'user',
                    default: ''
                }
            ],
            argsPromptLimit: 0
        });
    }

    async run( msg, { user } ) {
        // how many quotes in abbreviated embed?
        const quoteAbbreviatedCount = 5;
        // get member if default
        if ( user === '' ) user = msg.author;

        // get quotes of default
        const quotes = this.client.settings.get( `quotes:${user.id}` );

        if ( !quotes || quotes.length === 0 ) { return msg.channel.send( 'This user has no quotes. :(' ); }

        // add quotes to embed
        const retEmbed = generateDefaultEmbed({
            author: 'Quotes for ',
            title: user.tag,
            clientUser: this.client.user,
            msg: msg
        })
            .setThumbnail( user.displayAvatarURL() );
        const abbreviatedEmbed = generateDefaultEmbed({
            author: `Last ${quoteAbbreviatedCount} Quotes for `,
            title: user.tag,
            clientUser: this.client.user,
            msg: msg
        })
            .setThumbnail( user.displayAvatarURL() );

        abbreviatedEmbed.setDescription("You have been DM'ed the full list of quotes.\nReact with 📧 to also receive the full list.");

        quotes.forEach(( quote, idx ) => {
            if ( quote.length <= 1024 ) {
                retEmbed.addField( `Quote ${idx + 1}:`, quote );
                if ( quotes.length - idx <= quoteAbbreviatedCount ) { abbreviatedEmbed.addField(`Quote ${idx + 1}:`, quote); }
            }
        });

        if ( quotes.length > quoteAbbreviatedCount && msg.channel.type !== 'dm' ) {
            msg.author.send( retEmbed );
            msg.channel.send( abbreviatedEmbed )
                .then(async m => {
                    await m.react('📧');
                    const collector = m.createReactionCollector(reaction => {
                        return reaction.emoji.name === '📧';
                    }, { time: 60 * 60 * 1000 });
                    collector.on('collect', (_, user) => {
                        user.send(retEmbed)
                            .catch(err => {
                                if (err) {
                                    msg.channel.send('I cannot send messages to you for some reason.')
                                        .then(errorMessage => {
                                            setTimeout(() => errorMessage.delete(), 15000);
                                        });
                                }
                            });
                    });
                    collector.on('end', () => {
                        m.reactions.cache.forEach(r => {
                            if (r.emoji.name === '📧') r.remove();
                        });
                    });
                });
        } else { return msg.channel.send( retEmbed ); }
    }
};
