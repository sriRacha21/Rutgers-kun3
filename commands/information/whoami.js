const Commando = require('discord.js-commando')
const oneLine = require('oneline');
const parse = require('parse-git-config')
const { generateDefaultEmbed } = require("../../helpers/generateDefaultEmbed");

module.exports = class WhoAmICommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'whoami',
            group: 'information',
            memberName: 'whoami',
            description: 'Find out more about me!',
            details: 'Upon use of this command, output a RichEmbed containing information about this bot and the developer of this bot.'
        })
    }

    async run( msg, args ) {
        const embed = generateDefaultEmbed( 'Who am I?', `I'm ${this.client.user.username}!`, this.client.user, msg )
            .setDescription('I am a bot specially designed for the Rutgers Esports Discord, built on discord.js and Commando.')
            .addField('Programmer:', oneLine`I was written by Arjun Srivastav, <@${this.client.owners[0].id}>. He wrote this as a member of the Systems
                        and Tech committee at Rutgers Esports.`)
            .addField("I'm open source!", `I'm hosted at ${parse.sync()['remote "origin"'].url}.`)
            .addField('Thanks!', 'API for woof command by joey#1337 hosted at https://woofbot.io/')
        
        return msg.channel.send( embed )
    }
}