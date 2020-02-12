const Commando = require('discord.js-commando')
const request = require('request-promise')
const { getRandomElement } = require('../../helpers/getRandom')
const { loadingEdit } = require('../../helpers/loadingEdit')

module.exports = class WoofCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'woof',
            aliases: ['bark'],
            group: 'fun',
            memberName: 'woof',
            description: 'Cute dog.',
            examples: [
                'woof',
                'bark',
                'woof shiba',
                'woof german shepherd'
            ],
            throttling: { 
                usages: 1, 
                duration: 3
            },
            args: [
                {
                    key: 'breed',
                    type: 'string',
                    default: 'any',
                    prompt: 'Enter a dog breed.',
                }
            ],
            argsPromptLimit: 1,
        })
    }
    
    async run( msg, args ) {
        // get breeds and prepare to request them
        const breeds = this.client.registry.commands
        .filter(command => command.name == 'woof' )
        .first()
        .argsCollector
        .args[0]
        .oneOf
        const breed = args.breed == 'any' ? getRandomElement(breeds) : args.breed
        const url = `https://api.woofbot.io/v1/breeds/${breed}/image`

        // perform the request
        request(url)
        .then( req => {
            const json = JSON.parse(req)
            // return the url as a file
            loadingEdit(msg.channel, this.client.emojis, null, { files: [json.response.url] } )
        })
        .catch( err => msg.channel.send( `There was an error: ${err}` ))
    }
}