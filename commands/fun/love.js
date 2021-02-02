const Commando = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class LoveCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'love',
            group: 'fun',
            memberName: 'love',
            description: 'Find out how much one person loves another! :heart:',
            details: oneLine`Supply two string arguments to get a percentage of how much one argument loves another! Calculations 
                    are performed without regard to case or order.`,
            examples: ['love elijah matt', 'love \'person one\' \'person two\''],
            args: [
                {
                    key: 'one',
                    prompt: "Enter the first person's name.",
                    type: 'string',
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'two',
                    prompt: "Enter the second's name.",
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, args ) {
        // let percent be 100 if the strings match or they pass easterEgg compare, otherwise calculate
        const percent = args.one.localeCompare(args.two) === 0
            ? 100
            : this.loveCalculation(
                this.calcValFromStr(args.one), this.calcValFromStr(args.two)
            );

        // form calculation string
        return msg.reply( oneLine`${args.one} loves ${args.two}
            ${percent}%${percent === 100 ? '! :heart:' : ''}` + `\n${this.generateProgressBar(percent)}`, {
            allowedMentions: {} // don't allow the bot to mention anyone
        });
    }

    // calculate an integer value from a string by usnig ASCII codes
    calcValFromStr( str ) {
        let total = 0;
        for ( let i = 0; i < str.length; i++ ) { total += str.charCodeAt(i); }
        return total;
    }

    // get a percent from two integers
    loveCalculation( intOne, intTwo ) { return (intOne + intTwo) % 100; }

    // writing the progress bar to a message
    generateProgressBar( percent ) {
        const numHashes = percent / 5;
        let probar = '[';

        for ( let i = 0; i < 20; i++ ) probar += i < numHashes ? '#' : ' ';
        probar += ']';

        return '`' + probar + '`';
    }
};
