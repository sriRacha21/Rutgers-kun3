const Commando = require('discord.js-commando');
const parse = require('parse-git-config');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const fs = require('fs');
const contributors = JSON.parse(fs.readFileSync('settings/bot_settings.json', 'utf-8')).contributor;

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
        // conditionally figure out if we want to mention users or use their name depending on if they're in the server

        const embed = generateDefaultEmbed({
            author: 'Who am I?',
            title: `I'm ${this.client.user.username}!`,
            clientUser: this.client.user,
            msg: msg
        })
            .setDescription('I am a bot specially designed for the Rutgers Esports Discord, built on discord.js and Commando.')
            .addField('Programmer:', `I was written by Arjun Srivastav, <@${this.client.owners[0].id}>.`)
            .addField('Special Contributors:', contributors.map(c => `<@${c}>`).join('\n'))
            .addField('Thanks!', 'API for woof command by joey#1337 hosted at https://woofbot.io/')
            .addField("I'm open source!", `I'm hosted at ${parse.sync()['remote "origin"'].url}.`)
            .addField('Feeling Generous?', 'Buy me a coffee!: https://www.buymeacoffee.com/h4K7sQj');

        return msg.channel.send( embed );
    }
};
