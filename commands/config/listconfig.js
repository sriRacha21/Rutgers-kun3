const Commando = require('discord.js-commando');
const fs = require('fs');
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'));
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class ListConfigCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listconfig',
            aliases: [ 'listconfigs', 'configs' ],
            group: 'config',
            memberName: 'list',
            description: 'Show configured values.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true
        });
    }

    async run( msg ) {
        const settings = this.client.provider;

        // get fields we're putting in the embed
        const volume = settings.get( msg.guild, 'volume' );
        const approvalChannelID = settings.get( msg.guild, 'approvalChannel' );
        const agreementChannelID = settings.get( msg.guild, 'agreementChannel' );
        const agreementSlim = settings.get( msg.guild, 'agreementSlim' );
        const autoverifyArr = settings.get( msg.guild, 'autoverify' );
        const welcomeChannelID = settings.get( msg.guild, 'welcomeChannel' );
        const logChannelID = settings.get( msg.guild, 'logChannel' );
        const welcomeText = settings.get( msg.guild, 'welcomeText' );
        const removeInvites = settings.get( msg.guild, 'removeInvites' );
        const wordCountMessages = settings.get( msg.guild, 'wordCounters' );
        const agreementRoles = settings.get( msg.guild, 'agreementRoles' );
        const protectedRoles = settings.get( msg.guild, 'protectedRoles' ) ? settings.get( msg.guild, 'protectedRoles' ) : [];
        const muteRoleID = settings.get( msg.guild, 'muteRole' );
        const unpingableRoleIDs = settings.get( msg.guild, 'unpingableRoles' );

        // generate embed
        const embed = generateDefaultEmbed({
            author: 'Configs for server',
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: msg.guild.iconURL()
        });

        if ( volume ) { embed.addField( 'Volume:', volume ); }
        if ( approvalChannelID ) { embed.addField( 'Approval channel:', `<#${approvalChannelID}>` ); }
        if ( agreementChannelID ) { embed.addField( 'Agreement channel:', `<#${agreementChannelID}>` ); }
        if ( agreementSlim ) { embed.addField( 'Agreement Slim Setup:', `**Message ID:** ${agreementSlim.message}\n**Emote:** ${this.client.emojis.resolve(agreementSlim.emote)}\n**Role:** ${msg.guild.roles.resolve(agreementSlim.role)}`); }
        if ( autoverifyArr ) { embed.addField( 'Autoverify phrase and role:', autoverifyArr.map(av => `\`${av.phrase}\`, <@&${av.role}>`).join('\n') ); }
        if ( welcomeChannelID ) { embed.addField( 'Welcome channel:', `<#${welcomeChannelID}>` ); }
        if ( logChannelID ) { embed.addField( 'Log channel:', `<#${logChannelID}>` ); }
        if ( welcomeText ) { embed.addField( 'Welcome text:', welcomeText ); }
        embed.addField( 'Removing invites?:', removeInvites ? 'On' : 'Off' );
        // embed.addField( 'Detecting haikus?:', haiku ? 'Off' : 'On' )
        embed.addField( 'Word Count Messages?:', !wordCountMessages ? 'On' : 'Off' );
        if ( muteRoleID ) { embed.addField( 'Mute role:', `<@&${muteRoleID}>` ); }
        if ( agreementRoles && agreementRoles.length > 0 ) { embed.addField( 'Agreement Roles:', agreementRoles.map(role => `<@&${role.roleID}>, ${role.authenticate}`).join('\n') ); }
        if ( unpingableRoleIDs ) { embed.addField( 'Unpingable Roles:', unpingableRoleIDs.map(role => `<@&${role}>`).join('\n') ); }
        if ( protectedRoles.length > 0 ) { embed.addField( 'Protected Roles:', protectedRoles.map(role => `<@&${role}>`).join('\n') ); }

        return msg.reply( embed.fields.length > 0 ? embed : `No configs for this server. Set them up with \`${msg.guild.commandPrefix}help\` then run the commands under the \`config\` group.` );
    }
};
