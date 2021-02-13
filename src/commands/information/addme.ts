import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';
import { getRandomElement } from '../../helpers/getRandom';

export default class AddMeCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'addme',
            aliases: [ 'inv', 'invite' ],
            group: 'information',
            memberName: 'addme',
            description: 'Add me to another server!'
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embed = generateDefaultEmbed({
            author: 'Aww do you like me that much?',
            title: 'Add me to another server!',
            clientUser: this.client.user,
            msg: msg,
            guild: msg.guild
        });

        const emote = msg.guild && msg.guild.emojis.cache.size > 0 ? getRandomElement(msg.guild.emojis.cache.array()) : getRandomElement(this.client.emojis.cache.array());

        if (emote) {
            embed.setThumbnail(emote.url);
        }

        this.client.generateInvite()
            .then(link => {
                embed.setURL(link);
                msg.channel.send( embed );
            })
            .catch(e => { if (e) msg.channel.send(`Error encountered: ${e}`); });
    }
};
