const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/utility/generateDefaultEmbed');

module.exports = class FollowMeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'followme',
            aliases: [ 'follow', 'twitter' ],
            group: 'information',
            memberName: 'followme',
            description: 'Follow me on Twitter!'
        });
    }

    async run( msg ) {
        const embedInfo = {
            title: 'Follow me on Twitter!',
            clientUser: this.client.user,
            msg: msg
        };

        const author = this.client.owners[0];
        if ( msg.guild ) {
            const authorInGuild = await msg.guild.members.fetch(author.id);
            if ( authorInGuild ) { embedInfo.title = `Follow @${authorInGuild.user.tag} on Twitter!`; }
        }

        const embed = generateDefaultEmbed(embedInfo)
            .setThumbnail('https://help.twitter.com/content/dam/help-twitter/brand/logo.png')
            .setImage( 'https://pbs.twimg.com/profile_images/1335401233943842817/8gxW9p1h_400x400.jpg' )
            .setURL( 'https://twitter.com/sriRachaIsSpicy' );

        return msg.reply( embed );
    }
};
