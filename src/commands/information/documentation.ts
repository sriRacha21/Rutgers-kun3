import Commando, { CommandoClient, CommandoMessage } from 'discord.js-commando';
import fs from 'fs';
import path from 'path';
const permissionsPath = path.join(__dirname, '../../../settings/permissions_settings.json'); // fix this by importing json
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));
import { generateDefaultEmbed } from '../../helpers/generateDefaultEmbed';

module.exports = class DocumentationCommand extends Commando.Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'documentation',
            aliases: ['docs', 'doc'],
            group: 'information',
            memberName: 'documentation',
            description: 'Read the documentation for the bot.',
            userPermissions: [defaults.admin_permission],
            guildOnly: true
        });
    }

    async run(msg: CommandoMessage): Promise<any> {
        const embed = generateDefaultEmbed({
            author: `Rutgers-kun has been added to ${msg.guild.name}!`,
            title: 'Hiya!',
            clientUser: this.client.user,
            guild: msg.guild,
            thumbnail: msg.guild.iconURL()
        })
            .setDescription(`I see you've decided to add me to your server! I have a bunch of commands to configure the server to your liking.
    Read the documentation [here](https://github.com/sriRacha21/Rutgers-kun3/tree/master/documentation/setup.md).`)
            .addField('Have questions, feedback, or are interested in following the bot\'s development? Join the development server!:', 'https://discord.gg/YDEpNDV/');
        // check if the server owner is still in the server
        msg.author.send(embed)
            .then(m => msg.channel.send('Sent you a DM!'));
    }
};