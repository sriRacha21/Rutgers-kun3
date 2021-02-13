import Commando, { CommandoClient } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';

export default class BMACCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'bmac',
            aliases: [ 'buymeacoffee', 'coffee', 'payme' ],
            group: 'information',
            memberName: 'bmac',
            description: 'Buy me a coffee?'
        });
    }

    async run( msg ) {
        const embedInfo = {
            title: 'Buy me a Coffee?',
            clientUser: this.client.user,
            msg: msg
        };

        const author = this.client.owners[0];
        if ( msg.guild ) {
            const authorInGuild = await msg.guild.members.resolve(author.id);
            if ( authorInGuild ) { embedInfo.title = `Buy @${authorInGuild.user.tag} a Coffee?`; }
        }

        const embed = generateDefaultEmbed(embedInfo)
            .setImage( 'https://cdn.buymeacoffee.com/buttons/default-red.png' )
            .setURL( 'https://www.buymeacoffee.com/h4K7sQj' )
            .setThumbnail();

        msg.channel.send( embed );
    }
};
