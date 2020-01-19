const Commando = require('discord.js-commando')
const oneLine = require('oneline')
const { generateDefaultEmbed } = require("../../helpers/generateDefaultEmbed");
const { getRandomInt } = require("../../helpers/getRandom");

module.exports = class RollCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'roll',
            group: 'fun',
            memberName: 'roll',
            description: 'Roll any number of any-sided dice.',
            details: oneLine`Roll any number of any-sided dice and display the results of each roll along with the sum 
                            and average of the rolls. Note that the individual rolls will not display with dice counts 
                            beyond 20 to cut down on channel spam.`,
            examples: [`roll 1 6`,`roll 3 4`],
            args: [
                {
                    key: 'dice',
                    prompt: 'Enter the number of dice you want to roll.',
                    type: 'integer',
                    min: 1,
                    max: 1000
                },
                {
                    key: 'faces',
                    prompt: 'Enter the number of faces you want on each die.',
                    type: 'integer',
                    min: 1,
                    max: 1000
                }
            ],
            argsPromptLimit: 1,
        })
    }
    
    async run( msg, args ) {
        const embed = generateDefaultEmbed( 'Rolls Command', 'Rolls:', this.client.user, msg )
                        .setThumbnail() // remove the thumbnail to save on space
        const dice = args.dice
        const faces = args.faces
        let sum = 0

        for( let i = 0; i < dice; i++ ) {
            const random = getRandomInt( 1, faces+1 )
            if( dice <= 20 )
                embed.addField( `Roll ${i+1}:`, random, true )
            sum += random
        }

        embed.addField( `Sum:`, sum, true )
            .addField( `Average:`, sum/dice, true )

        return msg.channel.send( embed )
    }
}