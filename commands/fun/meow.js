const Commando = require('discord.js-commando')
const request = require('request-promise')

module.exports = class MeowCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'meow',
            group: 'fun',
            memberName: 'meow',
            description: 'Cute kitty.',
            details: 'Ouput a picture of a cute kitty chosen at random.',
            throttling: { 
                usages: 1, 
                duration: 3
            },
        })
    }
    
    async run( msg, args ) {
        const url = `https://aws.random.cat/meow`
        const req = await request(url)
        const json = JSON.parse(req)

        return msg.channel.send( { files: [json.file] } )
    }
}