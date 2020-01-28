const Commando = require('discord.js-commando')

module.exports = class DeleteWordCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'deleteword',
            aliases: [ 'removeword' ],
            group: 'fun',
            memberName: 'deleteword',
            description: 'Remove a word set by countword.',
            examples: [
                `deleteword zss sux`,
                `removeword cya`
            ],
            args: [
                {
                    key: 'word',
                    prompt: 'Enter the word that you don\'t want tracked anymore.',
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { word } ) {
        if( !this.client.settings.get( `countword:${msg.author.id}` ) )
            return msg.channel.send( `This word was not being tracked.` )
        
        this.client.settings.remove( `countword:${msg.author.id}` )
        .then( msg.channel.send( `Successfully removed word \`${word}\` from being tracked.` ) )
    }
}