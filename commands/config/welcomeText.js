const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { oneLine } = require('common-tags')

module.exports = class SetWelcomeTextCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setwelcometext',
            group: 'config',
            memberName: 'welcometext',
            description: oneLine`Configure the message that will be sent when a user joins the server. Use \`[guild]\` to replace that
part of the text with the guild name and [user] to replace that part of the text with a string mentioning the joining user. 
Just enter \`clear\` to clear the setting.`,
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'welcomeText',
                    label: 'welcome text',
                    prompt: `Enter the text you want a user to see when they enter the server.`,
                    type: 'string',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { welcomeText } ) {
        const settings = this.client.provider

        if( welcomeText === 'clear' )
            settings.remove( msg.guild, `welcomeText` )
            .then( msg.channel.send( `Welcome successfully removed.` ) )
        else {
            settings.set( msg.guild, `welcomeText`, welcomeText )
            .then( msg.channel.send( `Welcome text successfully set.` ))
        }
    }
}