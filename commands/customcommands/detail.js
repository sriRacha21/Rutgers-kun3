const Commando = require('discord.js-commando');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const { oneLine } = require('common-tags');

module.exports = class DetailCommandCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'detailcommand',
            aliases: [ 'detailscommand' ],
            group: 'customcommands',
            memberName: 'detail',
            description: 'Show details about a custom command.',
            details: 'This command shows various information about a command, such as when it was created and who created it.',
            guildOnly: true,
            examples: [
                'detailcommand',
                'detailcommand testcommand'
            ],
            args: [
                {
                    key: 'name',
                    prompt: 'Enter the name of the command you want to view the details of.',
                    type: 'string'
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { name } ) {
        const settings = this.client.provider;

        // check if command exists
        const commandInfo = settings.get(msg.guild, `commands:${name}`);
        if ( !commandInfo ) {
            return msg.channel.send( oneLine`A custom command by this name could not be found. 
Run \`${msg.guild.commandPrefix}listcommand\` to see a list of all commands.` );
        }

        const retEmbed = generateDefaultEmbed({
            author: 'Command details:',
            title: `Name: ${name}`,
            clientUser: this.client.user,
            msg: msg
        });
        if ( commandInfo.text ) { retEmbed.addField( 'Contents:', commandInfo.text ); }
        if ( commandInfo.attachment ) { retEmbed.addField( 'Attachment:', commandInfo.attachment ); }

        // check if user id is in cache
        const creator = await this.client.users.fetch( commandInfo.userID );
        // add user if found in cache
        if ( creator ) {
            retEmbed.addField( 'Creator:', `<@${commandInfo.userID}>` )
                .setThumbnail(creator.displayAvatarURL());
        }

        retEmbed.addField( 'Generated at:', commandInfo.timestamp );

        return msg.channel.send( retEmbed );
    }
};
