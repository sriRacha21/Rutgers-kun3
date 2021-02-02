const Commando = require('discord.js-commando');
const bent = require('bent');
const getJSON = bent('json');
const { getRandomElement } = require('../../helpers/getRandom');

module.exports = class WoofCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'woof',
            aliases: ['bark', 'dog'],
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
                    prompt: 'Enter a dog breed.'
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, args ) {
        msg.channel.startTyping();
        // get breeds and prepare to request them
        const breeds = this.client.registry.commands
            .filter(command => command.name === 'woof' )
            .first()
            .argsCollector
            .args[0]
            .oneOf;
        const breed = args.breed === 'any' ? getRandomElement(breeds) : args.breed;
        const url = `https://api.woofbot.io/v1/breeds/${breed}/image`;

        // perform the request
        getJSON(url)
            .then( res => {
                // return the url as a file
                msg.reply({ files: [res.response.url] });
            })
            .catch( err => msg.reply( `There was an error: ${err}` ))
            .finally(() => msg.channel.stopTyping());
    }
};
