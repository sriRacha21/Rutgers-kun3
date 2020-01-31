const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class ListConfigCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listconfig',
            aliases: [ 'listconfigs', 'configs' ],
            group: 'config',
            memberName: 'list',
            description: 'Show configured values.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
        })
    }

    async run( msg ) {
        const settings = this.client.provider

        // get fields we're putting in the embed
        const approvalChannelID = settings.get( msg.guild, `approvalChannel` )
        const rolesList = settings.get( msg.guild, `protectedRoles` ) ? settings.get( msg.guild, `protectedRoles` ) : []

        // generate embed
        const embed = generateDefaultEmbed({
            author: `Configs for server`,
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: msg.guild.iconURL
        })

        if( approvalChannelID )
            embed.addField( `Approval channel:`, `<#${approvalChannelID}>` )
        if( rolesList.length > 0 )
            embed.addField( 'Protected Roles:', rolesList.map(role => `<@${role}>`).join('\n') )

        return msg.channel.send( embed.fields.length > 0 ? embed : `No configs for this server. Set them up with \`${msg.guild.commandPrefix}config\`.` )
    }
}