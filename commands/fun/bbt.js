const Commando = require('discord.js-commando')
const exec = require('child_process').execSync
const { loadingEdit } = require('../../helpers/loadingEdit')

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
            hidden: true,
        })
    }

    async run( msg ) {
        loadingEdit( msg.channel, this.client.emojis, '```\n' + exec('python3 scripts/fa1939febb310bcb6f8e9809604a4211/bbt.py').toString() + '\n```' )
    }
}