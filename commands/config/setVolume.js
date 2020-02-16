const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetVolumeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setvolume',
            group: 'config',
            memberName: 'volume',
            description: 'Set the volume of the bot in voice channels in this server. Default is 10. (0-100)',
            guildOnly: true,
            userPermissions: [ defaults.admin_permission ],
            args: [
                {
                    key: 'volume',
                    type: 'integer',
                    prompt: 'Enter the desired volume for bots in this guild.',
                    min: 0,
                    max: 100
                }
            ]
        })
    }


    async run( msg, { volume } ) {
        const settings = this.client.provider

        settings.set( msg.guild, `volume`, volume )
        .then( msg.channel.send( `Volume successfully set to ${volume}.` ))
	}
}