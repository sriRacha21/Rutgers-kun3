import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';

export default class PullRequestCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'pullrequest',
            aliases: [ 'pr' ],
            group: 'information',
            memberName: 'pullrequest',
            description: 'Want to add something? Make a pull request.'
        });
    }

    async run(msg: CommandoMessage) {
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
