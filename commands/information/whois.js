const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')
const fs = require('fs'); 

module.exports = class WhoIsCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'whois',
            aliases: ['who', 'avatar', 'av'],
            group: 'information',
            memberName: 'whois',
            description: 'Describe a user with a Rich Embed.',
            args: [
                {
                    key: 'user',
                    type: 'user',
                    default: 'none',
                    prompt: 'Enter a user.'
                }
            ]
        })
    }


    async run( msg, { user } ) {
        // parse netIDs from file
        const netIDsFile = fs.readFileSync('settings/netids.json');
        const netIDs = JSON.parse(netIDsFile.toString());

        if( user == 'none' )
            user = msg.author;

        // normal stuff
        const embed = generateDefaultEmbed({
            author: `User information for`,
            title: user.tag,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: user.displayAvatarURL
        });
        embed.addField("Tag:", user)
        .addField("User ID:", user.id)
        .addField("Date user joined Discord:", user.createdAt.toDateString());
        
        // is a bot?
        if( user.bot )
            embed.setDescription('This is another bot! 😳');
        if( user.id == this.client.user.id ) {
            const kirbyay = this.client.emojis.find(e => e.name=='kirbyay');
            embed.setDescription(`If you want to find out more about me use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}whoami\` . ${kirbyay ? kirbyay : ''}`);
        }
        
        // shared servers
        const isOwner = this.client.owners.find(u => u.id == msg.author.id);
        if( isOwner && !msg.content.includes('whois') ) {
            const guilds = [];
            const fetchMemberPromises = this.client.guilds.map(g => g.fetchMember(user.id));
            Promise.all(fetchMemberPromises)
            .catch(err => {
                if( err ) console.warn(`Error returned: ${err}`);
            });
            this.client.guilds.forEach(g => {
                const maybeFoundMember = g.members.find(m => m.user.id == user.id);
                if( maybeFoundMember ) guilds.push( g );
            })
            if( guilds.length > 0 ) embed.addField(`Shared servers (${guilds.length}):`, guilds.map(g => g.name).join('\n'));

            // netID
            if( netIDs[user.id] ) embed.addField("Linked NetID:", netIDs[user.id]);
        }

        msg.channel.send( embed );
	}
}