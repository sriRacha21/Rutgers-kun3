import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';
import fs from 'fs';
import path from 'path';
const botSettingsPath = path.join(__dirname, '../../../settings/bot_settings.json');
const contributors = JSON.parse(fs.readFileSync(botSettingsPath, 'utf-8')).contributor;

export default class StarMeCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'starme',
            aliases: ['star'],
            group: 'information',
            memberName: 'starme',
            description: 'Star my repository!'
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embed = generateDefaultEmbed({
            title: 'Star my repository!',
            thumbnail: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            clientUser: this.client.user,
            msg: msg
        })
            .setDescription(`A special thanks to:\n${contributors.map(c => `<@${c}>`).join('\n')}\nfor contributing!`)
            .setURL('https://github.com/sriRacha21/Rutgers-kun3/stargazers');

        msg.channel.send(embed);
    }
};
