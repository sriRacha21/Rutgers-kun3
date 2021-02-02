const Commando = require('discord.js-commando');
const exec = require('child_process').execSync;

module.exports = class ScreenfetchCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'screenfetch',
            group: 'information',
            memberName: 'screenfetch',
            description: 'Run `screenfetch`.',
            hidden: true
        });
    }

    async run( msg ) {
        return msg.reply(
            exec('screenfetch -nN')
                .toString()
                .trim()
                .split('\n')
                .filter(line => line.trim() !== '' )
                .map(line => line.trim())
                .join('\n'), // this procedure removes non-important new lines and trims every line
            {
                split: true,
                code: 'bash'
            }
        );
    }
};
