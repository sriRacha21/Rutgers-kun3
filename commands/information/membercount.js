const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class MemberCountCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'membercount',
            aliases: [ 'mc' ],
            group: 'information',
            memberName: 'membercount',
            description: 'Get the number of members in the server. If agreement is enabled, will also list the count of agreed users.',
            guildOnly: true
        })
    }


    async run( msg, args ) {
        return msg.channel.send("WIP!");
        const embed = generateDefaultEmbed({
            author: `Configs for server`,
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: msg.guild.iconURL
        })

        // if there is agreement in this server do a fuller embed
        if( this.client.provider.get( msg.guild, `agreementRoles` ) || this.client.provider.get( msg.guild, `agreementSlim` ) ) {

        } else {

        }
	}
}