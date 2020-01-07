const Commando = require('discord.js-commando')
const { requestBreeds } = require('../../helpers/requestBreeds')

module.exports = class WoofCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'woof',
            aliases: ['bark'],
            group: 'fun',
            memberName: 'woof',
            description: 'Cute dog.',
            details: 'Output a picture of a cute dog chosen at random. Available breeds are: ',
            args: [
                {
                    key: 'breed',
                    type: 'string',
                    // default: 'any',
                    prompt: 'Enter a dog breed.',
                    oneOf: ['yes','no']
                }
            ],
            argsPromptLimit: 1,
        })
    }
    
    async run( msg, args ) {
        return msg.channel.send( `Breed was ${args.breed}. ${await requestBreeds()}`)
    }
}