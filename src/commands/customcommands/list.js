const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const { getCommandList } = require('../../helpers/dbUtilities');
const Pagination = require('discord-paginationembed');

module.exports = class ListCommandCommands extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'listcommand',
            aliases: [ 'listcommands', 'lcc', 'cc', 'customcommands', 'customcommand' ],
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
            msg.channel.send(err);
            return;
        }

        if ( filter ) { keys = keys.filter( key => key.includes(filter) ); }
        // perform another check on keys
        if ( keys.length === 0 ) { return msg.channel.send( err ); }
        // add keys to embed's description
        const commands = [];
        keys.forEach(( key ) => commands.push(`${msg.guild.commandPrefix}${key}`));
        const commandsSize = commands.length;
        // new embed for each 20 commands
        const commandsPerPage = 20;
        let nextCommands = commands.splice(0, commandsPerPage);
        const embeds = [];
        let i = 0;
        while (nextCommands.length > 0) {
            const embed = generateDefaultEmbed({
                author: 'Command list for ',
                title: msg.guild.name,
                thumbnail: msg.guild.iconURL(),
                clientUser: this.client.user,
                msg: msg,
                page: {
                    current: ++i,
                    total: Math.ceil(commandsSize / commandsPerPage)
                }
            });
            embed.setDescription(nextCommands.join('\n'));
            embeds.push(embed);
            nextCommands = commands.splice(0, commandsPerPage);
        }

        // send embeds
        new Pagination.Embeds()
            .setArray(embeds)
            .setAuthorizedUsers([msg.author.id])
            .setChannel(msg.channel)
            .build()
            .catch(err => {
                if (err) msg.channel.send(`I do not have the required permissions to create a paginated embed here. \`\`\`js\n${err}\n\`\`\``);
            });
    }
};
