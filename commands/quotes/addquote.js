const Commando = require('discord.js-commando')

module.exports = class AddQuoteCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'quote',
            aliases: [ 'addquote' ],
            group: 'quotes',
            memberName: 'add',
            description: 'Quote the last thing a user said.',
            guildOnly: true,
            examples: [
                'quote',
                `quote <@87525135241728000>`
            ],
            args: [
                {
                    key: 'member',
                    label: 'user',
                    prompt: 'Enter the user you want to quote.',
                    type: 'member',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { member } ) {
        const settings = this.client.settings

        // don't quote yourself or a bot u monkey
        if( msg.author.id == member.user.id )
            return msg.channel.send( `You can't quote yourself.` )
        if( member.user.bot )
            return msg.channel.send( `You can't quote a bot.` )

        // push quote to settings
        const maybeQuotes = settings.get( `quotes:${member.user.id}` )
        const quotes = maybeQuotes ? maybeQuotes : []
        const message = member.lastMessage
        // check if message could be found
        if( !message )
            return msg.channel.send( `${member.displayName}'s last message could not be found.` )
        // make sure we include attachments
        quotes.push( message.cleanContent.concat(message.attachments ? '\n'.concat(message.attachments.map(attachment => attachment.proxyURL).join('\n')) : '') )

        // set setting after push
        settings.set( `quotes:${member.user.id}`, quotes )
        .then( msg.channel.send( `Successfully saved quote for user @${member.displayName}!` ) )
    }
}