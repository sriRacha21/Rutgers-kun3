import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';

export default class DevelopmentServerCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'devserver',
            aliases: [ 'developmentserver', 'fanclub', 'server', 'development', 'dev' ],
            group: 'information',
            memberName: 'devserver',
            description: 'Join the development server!'
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embedInfo = {
            title: 'Join the development server!',
            clientUser: this.client.user,
            msg: msg
        };

        const embed = generateDefaultEmbed(embedInfo)
            .addField( 'Discord Server Link:', '[Click here to join.](https://discord.gg/YDEpNDV)' )
            .addField('Why should I join this server?', `* If you have questions regarding development or setup
* Feedback for current systems
* Suggestions for new features
* General small-scale bot discussion
* Bug reports`);

        msg.channel.send( embed );
    }
};
