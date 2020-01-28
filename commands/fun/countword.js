const Commando = require('discord.js-commando')

module.exports = class CountWordCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'countword',
            aliases: [ 'setword' ],
            group: 'fun',
            memberName: 'countword',
            description: 'Add a word whose frequency will be tracked.',
            examples: [
                `countword zss sux`,
                `setword cya`
            ],
            args: [
                {
                    key: 'word',
                    prompt: 'Enter the word to be tracked.',
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { word } ) {
        if( this.client.settings.get( `countword:${msg.author.id}` ) )
            return msg.channel.send( `This word is already being tracked.` )
        
        this.client.settings.set( `countword:${msg.author.id}`, {
            word: word,
            count: 0,
        } )
        .then( msg.channel.send( `Successfully set word \`${word}\` to be tracked.` ) )
    }
}