const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
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
        });
    }

    async run( msg, { user } ) {
        // parse netIDs from file
        const netIDsFile = fs.readFileSync('settings/netids.json');
        const netIDs = JSON.parse(netIDsFile.toString());

        if ( user === 'none' ) { user = msg.author; }

        // normal stuff
        const embed = generateDefaultEmbed({
            author: 'User information for',
            title: user.tag,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: user.displayAvatarURL({ dynamic: true })
        });
        embed.addField('Tag:', user)
            .addField('User ID:', user.id);

        if ( user.createdAt ) { embed.addField('Date user joined Discord:', user.createdAt.toDateString()); }

        // roles
        if ( msg.guild ) {
            let guildMember;
            try {
                guildMember = await msg.guild.members.fetch(user);
            } catch (err) {}
            if ( guildMember && guildMember.roles.cache.size > 1 ) { embed.addField('Roles:', guildMember.roles.cache.array().slice(1).join('\n')); }
        }

        // is a bot?
        if ( user.bot ) { embed.setDescription('This is another bot! 😳'); }
        if ( user.id === this.client.user.id ) {
            const kirbyay = this.client.emojis.cache.find(e => e.name === 'kirbyay');
            embed.setDescription(`If you want to find out more about me use \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}whoami\` . ${kirbyay || ''}`);
        }

        // shared servers
        const isOwner = this.client.owners.find(u => u.id === msg.author.id);
        if ( isOwner && !msg.content.includes('whois') ) {
            const guilds = [];
            const fetchMemberPromises = this.client.guilds.cache.map(g => g.members.fetch(user.id));
            Promise.all(fetchMemberPromises)
                .catch(err => {
                    if ( err ) console.warn(`Error returned: ${err}`);
                });
            this.client.guilds.cache.forEach(g => {
                const maybeFoundMember = g.members.cache.find(m => m.user.id === user.id);
                if ( maybeFoundMember ) guilds.push( g );
            });
            if ( guilds.length > 0 ) embed.addField(`Shared servers (${guilds.length}):`, guilds.map(g => g.name).join('\n'));

            // netID
            if ( netIDs[user.id] ) embed.addField('Linked NetID:', netIDs[user.id]);
        }

        msg.channel.send( embed );
    }
};
