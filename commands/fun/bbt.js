const Commando = require('discord.js-commando');
const exec = require('child_process').execSync;

module.exports = class BbtCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'bbt',
            aliases: [ 'bubbletea', 'boba' ],
            group: 'fun',
            memberName: 'bbt',
            description: 'Generate a random bubble tea from Cafe Zio.',
            details: 'Python script written by <@378686252926500874>.',
            throttling: {
                usages: 1,
                duration: 5
            },
            hidden: true
        });
    }

    async run( msg ) {
        msg.channel.startTyping();
        const chosenBbt = exec('python3 scripts/fa1939febb310bcb6f8e9809604a4211/bbt.py').toString();
        msg.channel.stopTyping();
        return msg.reply(chosenBbt);
    }
};
