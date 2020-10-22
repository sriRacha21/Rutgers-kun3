const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class FetchMessageCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'fetchmessage',
            group: 'information',
            memberName: 'fetchmessage',
            description: 'Fetch a message given a message URL.',
            args: [
                {
                    key: 'message',
                    type: 'message',
                    prompt: 'Enter a message to fetch and display details for.'
                }
            ],
            patterns: [
                /https:\/\/discord(?:app)?.com\/channels\/([0-9]{17,18})\/([0-9]{17,18})\/([0-9]{17,18})\/?/
            ]
        })
    }

    async run( msg, args, fromPattern ) {
        let message;

        if( fromPattern ) {
            // attempt to fetch the message from the regex match, exit gracefully if message could not be fetched
            const guild = this.client.guilds.get(args[1]);
            if( !guild ) return;
            const channel = guild.channels.get(args[2]);
            if( !channel ) return;
            try {
                await channel.fetchMessage(args[3]);
            } catch(err) {
                return;
            }
            let fetchedMessage = channel.messages.get(args[3]);
            if( !fetchedMessage ) return;
            message = fetchedMessage;
        } else {
            message = args.message;
        }

        const embed = generateDefaultEmbed({
            author: `Message Details`,
            title: `${message.author.tag} says:`,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: message.author.displayAvatarURL
        });

        if( message.content )
            embed.setDescription(message.content);
        if( (msg.guild && message.guild && (msg.guild.id != message.guild.id)) || (!msg.guild && message.guild) )
            embed.addField('Server:', message.guild.name)
        if( msg.channel.id != message.channel.id )
            embed.addField('Channel:', `${message.channel} (#${message.channel.name})`);
        if( !fromPattern )
            embed.addField('Source:', `[Jump!](${message.url})`);
        if( message.reactions.size > 0 ) {
            message.reactions.forEach(r => {
                embed.addField(`${r.emoji} used ${r.count} times by:`, r.users.array().join(', '));
            })
            // const userReactionDict = {};
            // message.reactions.forEach(r => {
            //     r.users.forEach(u => {
            //         if(userReactionDict[u.id] === undefined)
            //             userReactionDict[u.id] = [r.emoji];
            //         else
            //             userReactionDict[u.id].push(r.emoji);
            //     });
            // });
            // Object.keys(userReactionDict).forEach(uid => {
            //     let user = this.client.users.get(uid);
            //     embed.addField((user ? user.tag : uid) + "'s reactions:", userReactionDict[uid].join(', '));
            // });
        }

        if( message.attachments.size == 1 )
            embed.setImage(message.attachments.first().proxyURL);
        let messagePromise = msg.channel.send( embed );
        if( message.attachments.size > 1 )
            messagePromise = msg.channel.send({files: message.attachments.map(a => a.proxyURL)});
        return messagePromise;
	}
}
