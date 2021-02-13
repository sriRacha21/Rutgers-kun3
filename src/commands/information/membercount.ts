import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';
import fs from 'fs';
import path from 'path';
const permissionsPath = path.join(__dirname, '../../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));

export default class MemberCountCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'membercount',
            aliases: ['mc'],
            group: 'information',
            memberName: 'membercount',
            description: 'Get the number of members in the server. If agreement is enabled, will also list the count of agreed users.',
            guildOnly: true
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embed = generateDefaultEmbed({
            author: 'Member Count for',
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg,
            thumbnail: msg.guild.iconURL()
        });
        embed.addField('Full member count:', msg.guild.memberCount);

        // if there is agreement in this server do a fuller embed
        if ((this.client.provider.get(msg.guild, 'agreementRoles') || this.client.provider.get(msg.guild, 'agreementSlim')) && msg.member.hasPermission(defaults.moderator_permission)) {
            const unagreedCount = msg.guild.members.cache.filter(m => m.roles.size === 1).size;
            const agreedCount = msg.guild.members.cache.filter(m => m.roles.size > 1).size;

            embed.setAuthor(`Extended ${embed.author.name}`)
                .addField('Unagreed:', unagreedCount)
                .addField('Agreed:', agreedCount)
                .addField('Unagreed percentage:', unagreedCount / msg.guild.memberCount * 100 + '%');
            if (msg.guild.memberCount > 250) { embed.setDescription('**Disclaimer**: The agreed count and unagreed counts may not be exact since Discord does not cache all members in large servers for performance reasons.'); }
        }

        // send the embed
        msg.channel.send(embed);
    }
};
