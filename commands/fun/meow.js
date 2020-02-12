const Commando = require('discord.js-commando')
const request = require('request-promise')
const { loadingEdit } = require('../../helpers/loadingEdit')

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
        request(url)
        .then( req => {
            const json = JSON.parse(req)
            loadingEdit( msg.channel, this.client.emojis, null, { files: [json.file] } )
        })
        .catch( err => msg.channel.send( `There was an error: ${err}`))
    }
}