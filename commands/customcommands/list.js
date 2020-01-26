const Commando = require('discord.js-commando')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class ListCommandCommands extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listcommand',
            aliases: [ 'listcommands', 'lcc' ],
            group: 'customcommands',
            memberName: 'list',
            description: 'List all custom commands in a guild.',
            guildOnly: true,
            examples: [
                'listcommands',
                'listcommands arjun'
            ],
            args: [
                {
                    key: 'filter',
                    prompt: 'Enter text used to filter.',
                    type: 'string',
                    default: '',
                }
            ],
            argsPromptLimit: 0,
        })
    }

    async run( msg, { filter } ) {
        // prepare error message
        const err = `There are no custom commands in this server. Add one with \`${msg.guild.commandPrefix}addcommand\`.`
        // get all settings
        const settings = await this.client.provider.db.all( 'SELECT * FROM settings' )
        // filter settings to just this guild
        const guildSettings = settings.filter( setting => setting.guild == msg.guild.id )
        // if there are no settings at all in this guild there won't even be a row.
        if( guildSettings.length == 0 )
            return msg.channel.send( err )
        // get custom commands
        const customCommands = JSON.parse( guildSettings[0].settings )
        // get keys and filter them
        let keys = Object.keys(customCommands)
        .filter( key => key.startsWith('commands:') )
        .map( key => key.substring('commands:'.length) )
        if( filter )
            keys = keys.filter( key => key.includes(filter) )
        // perform another check on keys
        if( keys.length == 0 )
            return msg.channel.send( err )
        // prepare to return keys
        let retEmbed = generateDefaultEmbed({
            author: `Command list for`,
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg
        })
        // add keys to embed's description
        let description = '';
        keys.forEach(( key ) => { description += `${msg.guild.commandPrefix}${key}\n` })
        // clean up embed
        retEmbed.setThumbnail(msg.guild.iconURL)
        .setDescription(description)

        msg.channel.send( retEmbed )
    }
}