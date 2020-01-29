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
                'quote sriracha',
                `quote <@87525135241728000>`
            ],
            args: [
                {
                    key: 'user',
                    label: 'user',
                    prompt: 'Enter the user you want to quote.',
                    type: 'user',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { user } ) {
        const settings = this.client.settings

        // don't quote yourself or a bot u monkey
        if( msg.author.id == user.id )
            return msg.channel.send( `You can't quote yourself.` )
        if( user.bot )
            return msg.channel.send( `You can't quote a bot.` )

        // push quote to settings
        const maybeQuotes = settings.get( `quotes:${user.id}` )
        const quotes = maybeQuotes ? maybeQuotes : []
        const message = msg.channel.messages.filter(message => message.author.id == user.id).last()
        // check if message could be found
        if( !message )
            return msg.channel.send( `${user.username}'s last message could not be found in this channel.` )
        // check if there are 25 quotes already, if so remove the first one and add the last one
        while( quotes.length >= 25 )
            quotes.shift()
        // make sure we include attachments
        quotes.push( message.cleanContent.concat(message.attachments ? '\n'.concat(message.attachments.map(attachment => attachment.proxyURL).join('\n')) : '') )

        // set setting after push
        settings.set( `quotes:${user.id}`, quotes )
        .then( msg.channel.send( `Successfully saved quote for user @${user.username}!` ) )
    }
}