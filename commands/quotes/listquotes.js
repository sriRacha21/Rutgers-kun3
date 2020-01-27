const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class ListQuotesCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'quotes',
            aliases: [ 'listquote', 'listquotes' ],
            group: 'quotes',
            memberName: 'list',
            description: 'List quotes that have been logged for a user.',
            guildOnly: true,
            examples: [
                'quotes',
                'quotes <@87525135241728000>'
            ],
            args: [
                {
                    key: 'member',
                    label: 'user',
                    prompt: 'Enter the user whose quotes you want to view.',
                    type: 'member',
                    default: '',
                }
            ],
            argsPromptLimit: 0,
        })
    }

    async run( msg, { member } ) {
        // get member if default
        if( member=='' ) member = msg.member

        // get quotes of default
        const quotes = this.client.settings.get( `quotes:${member.user.id}` )

        if( !quotes )
            return msg.channel.send( `This user has no quotes. :(` )

        // add quotes to embed
        const retEmbed = generateDefaultEmbed({
            author: 'Quotes for ',
            title: member.user.tag,
            clientUser: this.client.user,
            msg: msg,
        })
        .setThumbnail( member.user.displayAvatarURL )

        let counter = 1
        quotes.forEach(( quote ) => {
            retEmbed.addField( `Quote ${counter}:`, quote )
        })

        return msg.channel.send( retEmbed )
    }
}