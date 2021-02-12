const Commando = require('discord.js-commando');
const { implementApprovalPolicy } = require('../../helpers/implementApprovalPolicy');
const RichEmbed = require('discord.js').MessageEmbed;
const { oneLine } = require('common-tags');
const { getCommandList } = require('../../helpers/dbUtilities');
const commandCountGuildLimit = 50;

module.exports = class AddCommandCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'addcommand',
            group: 'customcommands',
            memberName: 'add',
            description: 'Add a custom command to the bot.',
            details: oneLine`Attachments to the message calling 
the command will be attached to subsequent calls of the custom 
command. Use {} for a custom argument.`,
            guildOnly: true,
            examples: [
                'addcommand',
                'addcommand commandname example command text',
                'addcommand commandname {} has created a custom command with an argument.',
                'customcommands:add whenarjuntypes :Pog:'
            ],
            args: [
                {
                    key: 'name',
                    label: 'command name',
                    prompt: 'Enter the name of the command you want to create.',
                    type: 'string',
                    error: 'You provided an invalid command name. Command names must be alphanumeric and less than or equal to 20 characters.',
                    validate: str => {
                        const matches = str.match(/([a-z]|[0-9]){1,20}/gi);
                        return matches ? matches[0].length === str.length : false;
                    },
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'text',
                    label: 'command text',
                    prompt: 'Enter the text you want the command to output. Enter `nothing` for no text.',
                    type: 'string',
                    default: 'nothing',
                    validate: str => str.length > 0 && str.length <= 1500
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { name, text } ) {
        // check if there are 100 commands first
        // get command names from db
        let keys;
        try {
            keys = await getCommandList(this.client.provider.db, msg.guild, null);
        } catch (err) {
        }

        // replace text with empty string if the string is nothing
        text = text === 'nothing' ? '' : text;
        // remove new lines to not allow abuse
        text = text.replace('\n', ' ');
        // get the first attachment and add it to the command if it's there
        const attachment = msg.attachments.first();
        // dont allow command names that match the name of a custom command
        if ( this.client.registry.commands.array().map(c => c.name).includes(name) ) { return msg.channel.send( 'You cannot add a custom command if there is a built-in command with the same name.' ); }
        // exit if there is no text or attachment
        if ( !attachment && text === '' ) { return msg.channel.send( 'You cannot have no text and no attachments.' ); }
        // set up embed for approval policy
        const startEmbed = new RichEmbed()
            .addField( 'Command name:', name );
        if ( text !== '' ) { startEmbed.addField( 'Command text:', text.length > 1024 ? 'Look below for command text.' : text ); }
        // use approval policy
        implementApprovalPolicy(
            {
                type: 'command',
                submissionName: `${msg.guild.commandPrefix}${name}`,
                member: msg.member,
                runHasPerms: () => {
                    const settings = this.client.provider;
                    const commandSettings = {
                        text: text,
                        userID: msg.author.id,
                        timestamp: msg.createdAt.toLocaleString()
                    };
                    if ( attachment ) { commandSettings.attachment = attachment.proxyURL; }
                    settings.set( msg.guild, `commands:${name}`, commandSettings )
                        .then( () => {
                            msg.react('👍');
                            // eslint-disable-next-line no-unmodified-loop-condition
                            while (!!keys && keys.length > commandCountGuildLimit) {
                                settings.remove(msg.guild, `commands:${keys[0]}`);
                                keys.shift();
                            }
                        });
                },
                attachments: [ attachment ],
                settings: this.client.provider,
                errChannel: msg.channel
            },
            {
                title: msg.author.tag,
                clientUser: this.client.user,
                msg: msg,
                text: text,
                startingEmbed: startEmbed
            }
        );
    }
};
