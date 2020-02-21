const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class StarMeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'starme',
            aliases: [ 'star' ],
            group: 'information',
            memberName: 'starme',
            description: 'Star my repository!',
        })
    }


    async run( msg ) {
        const embed = generateDefaultEmbed({
            title: 'Star my repository!',
            thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            clientUser: this.client.user,
            msg: msg,
        })
        .setDescription( '[Link here!](https://github.com/sriRacha21/Rutgers-kun3/stargazers)' )

        msg.channel.send( embed )
	}
}
