const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/utility/generateDefaultEmbed');
const { getCommandList } = require('../../helpers/utility/dbUtilities');

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
                    default: ''
                }
            ],
            argsPromptLimit: 0
        });
    }

    async run( msg, { filter } ) {
        // prepare error message
        const err = `There are no custom commands in this server. Add one with \`${msg.guild.commandPrefix}addcommand\`.`;
        // get command names from db
        let keys;
        try {
            keys = await getCommandList(this.client.provider.db, msg.guild, err);
        } catch (err) {
            msg.reply(err);
            return;
        }

        if ( filter ) { keys = keys.filter( key => key.includes(filter) ); }
        // perform another check on keys
        if ( keys.length === 0 ) { return msg.reply( err ); }
        // prepare to return keys
        const retEmbed = generateDefaultEmbed({
            author: 'Command list for',
            title: msg.guild.name,
            clientUser: this.client.user,
            msg: msg
        });
        // add keys to embed's description
        let description = '';
        keys.forEach(( key ) => { description += `${msg.guild.commandPrefix}${key}\n`; });
        // clean up embed
        retEmbed.setThumbnail(msg.guild.iconURL())
            .setDescription(description);

        msg.reply( retEmbed )
            .then( m => m.react('🗑') );
    }
};
