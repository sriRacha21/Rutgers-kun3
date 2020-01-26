const Commando = require('discord.js-commando')

module.exports = class NullCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'null',
            group: 'rutgers-kun-util',
            memberName: 'null',
            description: 'Do nothing.',
            guarded: true,
            hidden: true,
            unknown: true
        })
    }

    async run( msg ) {
        // do nothing
        msg.channel.send( 'peepee' )
    }
}