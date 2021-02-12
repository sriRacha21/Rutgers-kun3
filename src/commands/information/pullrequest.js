const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class PullRequestCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'pullrequest',
            aliases: [ 'pr' ],
            group: 'information',
            memberName: 'pullrequest',
            description: 'Want to add something? Make a pull request.'
        });
    }

    async run( msg ) {
        const embed = generateDefaultEmbed({
            author: 'Have a suggestion?',
            title: 'Make a pull request!',
            thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            clientUser: this.client.user,
            msg: msg
        })
            .setURL('https://github.com/sriRacha21/Rutgers-kun3/pulls')
            .setDescription( 'Or create an [issue](https://github.com/sriRacha21/Rutgers-kun3/issues).' );

        return msg.channel.send( embed );
    }
};
