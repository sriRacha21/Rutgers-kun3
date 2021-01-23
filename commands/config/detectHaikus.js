const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class DetectHaikusCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'togglehaikus',
            aliases: [ 'togglehaiku', 'haiku' ],
            group: 'config',
            memberName: 'haiku',
            description: 'Toggle haiku detection.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            hidden: true
        })
    }


    async run( msg ) {
        const settings = this.client.provider;

        if( !settings.get( msg.guild, `haiku` ) ) {
            settings.set( msg.guild, `haiku`, true );
            msg.channel.send( 'Haiku detection turned off.' );
        } else {
            settings.remove( msg.guild, `haiku` )
            msg.channel.send( 'Haiku detection turned on.' );
        }
	}
}
