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
                    validate: str => str.match(/(?:[A-Z]|[0-9]){0,20}/i),
                    parse: str => str.toLowerCase(),
                    error: 'Word entered must be alphanumeric'
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { word } ) {
        // get array to set
        const arr = this.client.settings.get( `countword:${msg.author.id}` )
        ? this.client.settings.get( `countword:${msg.author.id}` )
        : []
        
        // check if new word is in the array
        if( arr.map(wordCountInfo => wordCountInfo.word).filter(wordArr => wordArr.includes(word) || word.includes(wordArr) ).length > 0 )
            return msg.channel.send( `Word cannot be set because you have a similar or the same word already being tracked.` )

        // put new word in array
        arr.push({
            word: word,
            count: 0,
        })

        // set the array in the settings
        this.client.settings.set( `countword:${msg.author.id}`, arr )
        .then( msg.channel.send( `Successfully set word \`${word}\` to be tracked.` ) )
    }
}