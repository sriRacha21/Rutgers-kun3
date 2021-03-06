const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const { getRandomElement } = require('../../helpers/getRandom');

module.exports = class AddMeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addme',
            aliases: [ 'inv', 'invite' ],
            group: 'information',
            memberName: 'addme',
            description: 'Add me to another server!'
        });
    }

    async run( msg ) {
        const embed = generateDefaultEmbed({
            author: 'Aww do you like me that much?',
            title: 'Add me to another server!',
            clientUser: this.client.user,
            msg: msg,
            guild: msg.guild
        });

        const emote = msg.guild && msg.guild.emojis.cache.size > 0 ? getRandomElement(msg.guild.emojis.cache.array()) : getRandomElement(this.client.emojis.cache.array());
        embed.setThumbnail(emote.url);

        this.client.generateInvite()
            .then(link => {
                embed.setURL(link);
                msg.channel.send( embed );
            })
            .catch(e => { if (e) msg.channel.send(`Error encountered: ${e}`); });
    }
};
