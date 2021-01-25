const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const fs = require('fs');

module.exports = class NetidCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'netid',
            group: 'moderation',
            memberName: 'netid',
            description: 'Lookup a netID with the bot.',
            args: [
                {
                    key: 'netid',
                    prompt: 'Enter the netID you want to look up.',
                    type: 'string',
                    parse: str => str.toLowerCase()
                }
            ],
            ownerOnly: true
        })
    }


    async run( msg, { netid } ) {
        // make sure the netids file exists
        if( !fs.existsSync('settings/netids.json') ) 
            return msg.channel.send("You are not logging netID's so you cannot use this command.");
        const userIDs = JSON.parse(fs.readFileSync('settings/netids.json','utf-8'));
        // iterate over whole json object <key: userID, value: netID> to find netID
        let foundUserID;
        for( const key in userIDs ) 
            if( userIDs[key] == netid )
                foundUserID = key;
        
        // send not found message
        if( !foundUserID )
            return msg.channel.send( `NetID ${netid} not found.` );
        
        // create initial embed if the user is found
        const embed = generateDefaultEmbed({
            author: `NetID ${netid} found`,
            title: '',
            clientUser: this.client.user,
            msg: msg
        })
        .addField('User',`<@${foundUserID}> (${foundUserID})`)

        // if the user is in the bot's cache, beautify embed
        const maybeUser = await this.client.users.fetch( foundUserID );
        if( maybeUser ) {
            embed.setTitle( maybeUser.tag )
            embed.setThumbnail( maybeUser.displayAvatarURL() )
        }

        // get mutual guilds
        const guilds = [];
        this.client.guilds.cache.forEach( guild => {
            if( guild.members.cache.find( m => m.user.id == foundUserID ) )
                guilds.push( guild );
        })
        if( guilds.length > 0 )
            embed.setDescription(`**Shared servers (${guilds.length})**:
${guilds.map(g => g.name).join('\n')}`);

        // send the embed
        return msg.channel.send( embed );
	}
}