const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'))

module.exports = class RemoveMessageCountersCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'togglewordcounters',
            aliases: [ 'togglewordtracker', 'togglewordcounter', 'togglewordtrackers' ],
            group: 'config',
            memberName: 'togglewordcounters',
            description: 'Toggle the output of word tracking messages for the guild.',
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'channel',
                    label: 'for this channel?',
                    prompt: 'Would you like to turn off word counter messages for this channel?',
                    type: 'boolean',
                    default: false
                }
            ]
        })
    }


    async run( msg, args ) {
        const settings = this.client.provider

        if( args.channel ) {
            if( !settings.get( msg.guild, `wordCounters:${msg.channel.id}`) ) {
                settings.set( msg.guild, `wordCounters:${msg.channel.id}`, true )
                msg.channel.send( `Word counting messages turned off for channel ${msg.channel}.` )
            } else {
                settings.remove( msg.guild, `wordCounters:${msg.channel.id}` )
                msg.channel.send( `Word counting messages turned on for channel ${msg.channel}.` )
            }
        } else if( !settings.get( msg.guild, `wordCounters` ) ) {
            settings.set( msg.guild, `wordCounters`, true )
            msg.channel.send( 'Word counting messages turned off.' )
        } else {
            settings.remove( msg.guild, `wordCounters` )
            msg.channel.send( 'Word counting messages turned on.' )
        }
	}
}