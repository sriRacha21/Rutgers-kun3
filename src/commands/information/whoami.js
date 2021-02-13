const Commando = require('discord.js-commando');
const packageJSON = require('../../../package.json');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const fs = require('fs');
const path = require('path');
const botSettingsPath = path.join(__dirname, '../../settings/bot_settings.json');
const contributorIDs = JSON.parse(fs.readFileSync(botSettingsPath, 'utf-8')).contributor;
const logger = require('../../logger');

module.exports = class WhoAmICommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'whoami',
            group: 'information',
            memberName: 'whoami',
            description: 'Find out more about me!',
            details: 'Upon use of this command, output a RichEmbed containing information about this bot and the developer of this bot.'
        });
    }

    async run( msg ) {
        // add owners
        const owners = this.client.owners;
        // add contributors
        const contributors = [];
        for (const cID of contributorIDs) {
            try {
                // is the contributor reachable by the bot?
                const contributor = await this.client.users.fetch(cID);
                contributors.push(contributor.tag);
            } catch (err) {
                logger.log('error', `Contributor (${cID}) not found!`, err);
            }
        }

        const embed = generateDefaultEmbed({
            author: 'Who am I?',
            title: `I'm ${this.client.user.username}!`,
            clientUser: this.client.user,
            msg: msg
        })
            .setDescription('I am a bot specially designed for the Rutgers Esports Discord, built on discord.js and Commando.');
        // add in owners if they could be found
        if (owners && owners.length > 0) embed.addField('Programmer:', `I was written by Arjun Srivastav, ${owners.map(o => o.tag).join(', ')}.`);
        // add in contributors if they could be found
        if (contributors && contributors.length > 0) embed.addField('Special Contributors:', contributors.join(', '));
        embed.addField('Thanks!', 'API for woof command by joey#1337 hosted [here](https://woofbot.io/).')
            .addField("I'm open source!", `I'm hosted [here](${packageJSON.homepage}).`)
            .addField('Feeling Generous?', '[Buy me a coffee!](https://www.buymeacoffee.com/h4K7sQj)')
            .attachFiles([{
                attachment: './resources/branding/Chibiarjun_horizontal_text.png',
                name: 'horizontal_brand_text.png'
            }])
            .setImage('attachment://horizontal_brand_text.png');

        return msg.channel.send( embed );
    }
};
