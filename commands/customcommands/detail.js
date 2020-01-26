const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class DetailCommandCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'detailcommand',
            aliases: [ 'detailscommand' ],
            group: 'customcommands',
            memberName: 'detail',
            description: 'Show details about a custom command.',
            details: 'This command shows various information about a command, such as when it was created and who created it.',
            examples: [
                'detailcommand',
                'detailcommand testcommand',
            ],
            guildOnly: true,
            args: [
                {
                    key: 'name',
                    prompt: 'Enter the name of the command you want to view the details of.',
                    type: 'string'
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { name } ) {
        const guildSettings = this.client.settings

        // check if command exists
        const commandInfo = guildSettings.get(`commands:${name}`)
        if( !commandInfo )
            return msg.channel.send( `A custom command by this name could not be found. Run ${this.client.commandPrefix}listcommands to see a list of all commands.` )

        const retEmbed = generateDefaultEmbed({
            author: 'Command details:',
            title: `Name: ${name}`,
            clientUser: this.client.user,
            msg: msg
        })
        .addField( `Contents:`, commandInfo.text )
        
        // check if user id is in cache
        const creator = this.client.users.find( user => user.id == commandInfo.userID )
        // add user if found in cache
        if( creator )
            retEmbed.addField( `Creator:`, `<@${commandInfo.userID}>` )
            .setThumbnail(creator.displayAvatarURL)

        retEmbed.addField( `Generated at:`, commandInfo.timestamp )

        return msg.channel.send( retEmbed )
    }
}