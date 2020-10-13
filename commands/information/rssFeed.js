const Commando = require('discord.js-commando')
const RssFeedEmitter = require('rss-feed-emitter');
const feeder = new RssFeedEmitter();
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')
const stripHtml = require('string-strip-html');
const { inspect } = require('util');

module.exports = class RssFeedCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'rssfeed',
            aliases: ['rss', 'setrss'],
            group: 'information',
            memberName: 'rssfeed',
            description: 'Set a channel to automatically post updates from an RSS feed.',
            args: [
                {
                    key: 'feedLink',
                    prompt: 'Enter the URL for the link to the feed.',
                    type: 'string',
                }, {
                    key: 'channel',
                    prompt: 'Enter the channel to post updates to.',
                    type: 'channel'
                }
            ],
            ownerOnly: true
        })
    }


    async run( msg, { feedLink, channel } ) {
        feeder.add({
            url: feedLink
        });

        feeder.on('new-item', item => {
            const yesterday = new Date(new Date());
            yesterday.setDate(yesterday.getDate()-1);
            // skip items over a day old
            if( item.pubDate.getTime() < yesterday.getTime() )
                return;

            const embed = generateDefaultEmbed({
                author: 'RSS Feed Update',
                title: item.title,
                clientUser: this.client.user
            });
            embed.setDescription(stripHtml(item.description).result);
            embed.setFooter(`Published at ${item.pubDate}`);
            embed.addField('Link:', item.link)

            msg.channel.send(embed);
        });
        console.log(feeder.list);
	}
}