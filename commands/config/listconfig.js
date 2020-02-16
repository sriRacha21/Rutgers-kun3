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
        const agreementChannelID = settings.get( msg.guild, `agreementChannel` )
        const autoverifyObj = settings.get( msg.guild, `autoverify` )
        const welcomeChannelID = settings.get( msg.guild, `welcomeChannel` )
        const logChannelID = settings.get( msg.guild, `logChannel` )
        const welcomeText = settings.get( msg.guild, `welcomeText` )
        const agreementRoles = settings.get( msg.guild, `agreementRoles` )
        const protectedRoles = settings.get( msg.guild, `protectedRoles` ) ? settings.get( msg.guild, `protectedRoles` ) : []
        const muteRoleID = settings.get( msg.guild, `muteRole` )
        const liveRoleID = settings.get( msg.guild, `liveRole` )
        const unpingableRoleIDs = settings.get( msg.guild, `unpingableRoles` )

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
        if( autoverifyObj )
            embed.addField( `Autoverify phrase and role:`, `\`${autoverifyObj.phrase}\`, <@&${autoverifyObj.role}>` )
        if( welcomeChannelID )
            embed.addField( `Welcome channel:`, `<#${welcomeChannelID}>` )
        if( logChannelID )
            embed.addField( `Log channel:`, `<#${logChannelID}>` )
        if( welcomeText )
            embed.addField( `Welcome text:`, welcomeText )
        if( muteRoleID )
            embed.addField( `Mute role:`, `<@&${muteRoleID}>` )
        if( liveRoleID )
            embed.addField( `Live role:`, `<@&${liveRoleID}>` )
        if( agreementRoles && agreementRoles.length > 0 )
            embed.addField( `Agreement Roles:`, agreementRoles.map(role => `<@&${role.roleID}>, ${role.authenticate}`).join('\n') )
        if( unpingableRoleIDs )
            embed.addField( `Unpingable Roles:`, unpingableRoleIDs.map(role => `<@&${role}>`).join('\n') )
        if( protectedRoles.length > 0 )
            embed.addField( 'Protected Roles:', protectedRoles.map(role => `<@&${role}>`).join('\n') )

        return msg.channel.send( embed.fields.length > 0 ? embed : `No configs for this server. Set them up with \`${msg.guild.commandPrefix}help\` then run the commands under the \`config\` group.` )
    }
}