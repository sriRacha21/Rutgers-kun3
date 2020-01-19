const Commando = require('discord.js-commando')
const { getRandomInt } = require('../../helpers/getRandom')

module.exports = class EightBallCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: '8ball',
            aliases: ['eightball'],
            group: 'fun',
            memberName: '8ball',
            description: 'Ask the mysterious eight-ball yes or no questions.',
            examples: [`8ball 'Will I pass Calc 2?'`],
            args: [
                {
                    key: 'question',
                    prompt: 'Enter the question you want to ask the eight ball.',
                    type: 'string',
                    parse: str => { return str.endsWith('?') ? str : `${str}?` }
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, args ) {
        const question = args.question
        const eightBallResponses = [
            "It is certain.",
            "Without a doubt.",
            "Yes - definitely.",
            "As I see it, yes.",
            "Signs point to yes.",
            "Don't count on it.",
            "My reply is no.",
            "My sources say no.",
            "Outlook not so good.",
            "Very doubtful.",
        ]

        return msg.reply(`**Answering question:** ${question}
**Response:** ${eightBallResponses[getRandomInt(0,eightBallResponses.length)]}`)
    }
}