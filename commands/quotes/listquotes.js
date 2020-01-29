const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

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
                    default: '',
                }
            ],
            argsPromptLimit: 0,
        })
    }

    async run( msg, { user } ) {
        // get member if default
        if( user=='' ) user = msg.author

        // get quotes of default
        const quotes = this.client.settings.get( `quotes:${user.id}` )

        if( !quotes || quotes.length == 0 )
            return msg.channel.send( `This user has no quotes. :(` )

        // add quotes to embed
        const retEmbed = generateDefaultEmbed({
            author: 'Quotes for ',
            title: user.tag,
            clientUser: this.client.user,
            msg: msg,
        })
        .setThumbnail( user.displayAvatarURL )

        let counter = 1
        quotes.forEach(( quote ) => {
            retEmbed.addField( `Quote ${counter}:`, quote )
            counter++
        })

        return msg.channel.send( retEmbed )
    }
}