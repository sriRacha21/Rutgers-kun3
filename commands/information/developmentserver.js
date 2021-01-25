const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class DevelopmentServerCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'devserver',
            aliases: [ 'developmentserver', 'fanclub', 'server', 'development', 'dev' ],
            group: 'information',
            memberName: 'devserver',
            description: 'Join the development server!',
        })
    }


    async run( msg ) {
        const embedInfo = {
            title: 'Join the development server!',
            clientUser: this.client.user,
            msg: msg,
        }

        const embed = generateDefaultEmbed(embedInfo)
        .setURL( 'https://discord.gg/YDEpNDV' );

        msg.channel.send( embed )
    }
}
