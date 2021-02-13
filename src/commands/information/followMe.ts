import { GuildMember } from 'discord.js';
import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';

export default class FollowMeCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'followme',
            aliases: [ 'follow', 'twitter' ],
            group: 'information',
            memberName: 'followme',
            description: 'Follow me on Twitter!'
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embedInfo = {
            title: 'Follow me on Twitter!',
            clientUser: this.client.user,
            msg: msg
        };

        const author = this.client.owners[0];
        if ( msg.guild ) {

            let authorInGuild: GuildMember = null;
            try {
                authorInGuild = await msg.guild.members.fetch(author.id);
            } catch (error) {
                console.log(error);
            }

            if ( authorInGuild ) {
                embedInfo.title = `Follow @${authorInGuild.user.tag} on Twitter!`;
            } else {
                embedInfo.title = 'Follow @sriRachaIsSpicy on Twitter!';
            }
        }

        const embed = generateDefaultEmbed(embedInfo)
            .setThumbnail('https://help.twitter.com/content/dam/help-twitter/brand/logo.png')
            .setImage( 'https://pbs.twimg.com/profile_images/1335401233943842817/8gxW9p1h_400x400.jpg' )
            .setURL( 'https://twitter.com/sriRachaIsSpicy' );

        msg.channel.send( embed );
    }
};
