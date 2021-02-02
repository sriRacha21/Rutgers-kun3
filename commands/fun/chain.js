const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/utility/generateDefaultEmbed');

module.exports = class ChainCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'chain',
            group: 'fun',
            memberName: 'chain',
            description: 'See the chain highscore for this server',
            guildOnly: true
        });
    }

    async run( msg ) {
        const maybeHighscoreInfo = this.client.provider.get( msg.guild, 'chain:highscore' );
        return msg.reply( maybeHighscoreInfo
            ? generateDefaultEmbed({
                author: `Longest chain in server ${msg.guild.name}`,
                title: `Chain size: ${maybeHighscoreInfo.score}`,
                clientUser: this.client.user,
                msg: msg,
                thumbnail: msg.guild.iconURL
            })
                .addField('Message:', maybeHighscoreInfo.message)
                .addField('Channel:', `<#${maybeHighscoreInfo.channel}>`)
                .addField('Breaker:', `<@${maybeHighscoreInfo.breaker}>`)
            : 'No chain highscore set for this server yet.'
        );
    }
};
