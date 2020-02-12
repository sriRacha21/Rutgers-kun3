const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')
const { idsToValues } = require('../../helpers/idsToValues')

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
        const agreementChannelID = settings.get( msg.guild, `agreementChannel` )
        const welcomeChannelID = settings.get( msg.guild, `welcomeChannel` )
        const welcomeText = settings.get( msg.guild, `welcomeText` )
        const agreementRoles = settings.get( msg.guild, `agreementRoles` )
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
        if( agreementChannelID )
            embed.addField( `Agreement channel:`, `<#${agreementChannelID}>` )
        if( welcomeChannelID )
            embed.addField( `Welcome channel:`, `<#${welcomeChannelID}>` )
        if( welcomeText )
            embed.addField( `Welcome text:`, welcomeText )
        if( agreementRoles && agreementRoles.length > 0 ) {
            // agreementRoles.forEach( agreementRole => {
            //     agreementRole.roleID = msg.guild.roles.find(role => role.id == agreementRole.roleID)
            // })
            embed.addField( `Agreement Roles:`, agreementRoles.map(role => `<@&${role.roleID}>, ${role.authenticate}`).join('\n') )
        }
        if( rolesList.length > 0 )
            embed.addField( 'Protected Roles:', rolesList.map(role => `<@&${role}>`).join('\n') )

        return msg.channel.send( embed.fields.length > 0 ? embed : `No configs for this server. Set them up with \`${msg.guild.commandPrefix}config\`.` )
    }
}