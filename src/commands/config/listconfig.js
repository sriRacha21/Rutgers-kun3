const Commando = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const permissionsPath = path.join(__dirname, '../../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class ListConfigCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listconfig',
            aliases: ['listconfigs', 'configs'],
            group: 'config',
            memberName: 'list',
            description: 'Show configured values.',
            userPermissions: [defaults.admin_permission],
            guildOnly: true,
            args: [
                {
                    key: 'guildToCheck',
                    label: 'server',
                    prompt: 'Enter the guild you want to check.',
                    type: 'guild',
                    default: ''
                }
            ]
        });
    }

    async run(msg, { guildToCheck }) {
        const guild = guildToCheck === '' ? msg.guild : guildToCheck;
        const settings = this.client.provider;

        // get fields we're putting in the embed
        const volume = settings.get(guild, 'volume');
        const approvalChannelID = settings.get(guild, 'approvalChannel');
        const agreementChannelID = settings.get(guild, 'agreementChannel');
        const agreementSlim = settings.get(guild, 'agreementSlim');
        const autoverifyArr = settings.get(guild, 'autoverify');
        const welcomeChannelID = settings.get(guild, 'welcomeChannel');
        const logChannelID = settings.get(guild, 'logChannel');
        const welcomeText = settings.get(guild, 'welcomeText');
        const removeInvites = settings.get(guild, 'removeInvites');
        const wordCountMessages = settings.get(guild, 'wordCounters');
        const agreementRoles = settings.get(guild, 'agreementRoles');
        const protectedRoles = settings.get(guild, 'protectedRoles') ? settings.get(guild, 'protectedRoles') : [];
        const muteRoleID = settings.get(guild, 'muteRole');
        const unpingableRoleIDs = settings.get(guild, 'unpingableRoles');

        // generate embed
        const embed = generateDefaultEmbed({
            author: 'Configs for server',
            title: guild.name,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: guild.iconURL()
        });

        if (volume) { embed.addField('Volume:', volume); }
        if (approvalChannelID) { embed.addField('Approval channel:', `<#${approvalChannelID}>`); }
        if (agreementChannelID) { embed.addField('Agreement channel:', `<#${agreementChannelID}>`); }
        if (agreementSlim) { embed.addField('Agreement Slim Setup:', `**Message ID:** ${agreementSlim.message}\n**Emote:** ${this.client.emojis.resolve(agreementSlim.emote)}\n**Role:** ${guild.roles.resolve(agreementSlim.role)}`); }
        if (autoverifyArr) { embed.addField('Autoverify phrase and role:', autoverifyArr.map(av => `\`${av.phrase}\`, <@&${av.role}>`).join('\n')); }
        if (welcomeChannelID) { embed.addField('Welcome channel:', `<#${welcomeChannelID}>`); }
        if (logChannelID) { embed.addField('Log channel:', `<#${logChannelID}>`); }
        if (welcomeText) { embed.addField('Welcome text:', welcomeText); }
        embed.addField('Removing invites?:', removeInvites ? 'On' : 'Off');
        // embed.addField( 'Detecting haikus?:', haiku ? 'Off' : 'On' )
        embed.addField('Word Count Messages?:', !wordCountMessages ? 'On' : 'Off');
        if (muteRoleID) { embed.addField('Mute role:', `<@&${muteRoleID}>`); }
        if (agreementRoles && agreementRoles.length > 0) { embed.addField('Agreement Roles:', agreementRoles.map(role => `<@&${role.roleID}>, ${role.authenticate}`).join('\n')); }
        if (unpingableRoleIDs) { embed.addField('Unpingable Roles:', unpingableRoleIDs.map(role => `<@&${role}>`).join('\n')); }
        if (protectedRoles.length > 0) { embed.addField('Protected Roles:', protectedRoles.map(role => `<@&${role}>`).join('\n')); }

        return msg.channel.send(embed.fields.length > 0 ? embed : `No configs for this server. Set them up with \`${guild.commandPrefix}help\` then run the commands under the \`config\` group.`);
    }
};
