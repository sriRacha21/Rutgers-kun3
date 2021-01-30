const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class ShowWordCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'showword',
            aliases: [ 'listword', 'listwords', 'showwords', 'tracking' ],
            group: 'fun',
            memberName: 'showword',
            description: 'Show a list of words tracked with `countword`.',
            args: [
                {
                    key: 'user',
                    prompt: 'Enter the user whose words you want to list.',
                    type: 'user',
                    default: 'me'
                }
            ]
        });
    }

    async run( msg, { user } ) {
        if ( user === 'me' ) { user = msg.author; }

        const words = this.client.settings.get(`countword:${user.id}`);
        if ( words && words.length > 0 ) {
            const embed = generateDefaultEmbed({
                author: 'Words tracked for',
                title: user.tag,
                clientUser: this.client.user,
                msg: msg,
                thumbnail: user.displayAvatarURL
            });
            words.forEach(w => {
                embed.addField(w.word, w.count);
            });
            return msg.channel.send(embed);
        }
        return msg.channel.send(`No words tracked for ${user.tag}.`);
    }
};
