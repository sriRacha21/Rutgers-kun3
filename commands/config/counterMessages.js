const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class RemoveMessageCountersCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'togglewordcounters',
            aliases: [ 'togglewordtracker', 'togglewordcounter', 'togglewordtrackers' ],
            group: 'config',
            memberName: 'togglewordcounters',
            description: 'Toggle the output of word tracking messages for the guild.',
            userPermissions: [ defaults.admin_permission ]
        })
    }


    async run( msg ) {
        const settings = this.client.provider

        if( !settings.get( msg.guild, `wordCounters`) ) {
            settings.set( msg.guild, `wordCounters`, true )
            msg.channel.send( 'Word counting messages turned off.' )
        } else {
            settings.remove( msg.guild, `wordCounters` )
            msg.channel.send( 'Word counting messages turned on.' )
        }
	}
}