const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/utility/generateDefaultEmbed');
const fs = require('fs');
const contributors = JSON.parse(fs.readFileSync('settings/bot_settings.json', 'utf-8')).contributor;

module.exports = class StarMeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'starme',
            aliases: [ 'star' ],
            group: 'information',
            memberName: 'starme',
            description: 'Star my repository!'
        });
    }

    async run( msg ) {
        const embed = generateDefaultEmbed({
            title: 'Star my repository!',
            thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            clientUser: this.client.user,
            msg: msg
        })
            .setDescription(`A special thanks to:\n${contributors.map(c => `<@${c}>`).join('\n')}\nfor contributing!`)
            .setURL( 'https://github.com/sriRacha21/Rutgers-kun3/stargazers' );

        return msg.reply( embed );
    }
};
