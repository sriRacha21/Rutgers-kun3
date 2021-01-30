const Commando = require('discord.js-commando');
const fs = require('fs');
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'));
const { oneLine } = require('common-tags');

module.exports = class SetWelcomeTextCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setwelcometext',
            group: 'config',
            memberName: 'welcometext',
            description: oneLine`Configure the message that will be sent when a user joins the server. Use \`[guild]\` to replace that
part of the text with the guild name and \`[user]\` to replace that part of the text with a string mentioning the joining user. 
Just enter \`clear\` to clear the setting.`,
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'welcomeText',
                    label: 'welcome text',
                    prompt: oneLine`Enter the text you want a user to see when they enter the server. Use \`[guild]\` to replace that
part of the text with the guild name and \`[user]\` to replace that part of the text with a string mentioning the joining user. 
Just enter \`clear\` to clear the setting.`,
                    type: 'string'
                }
            ],
            argsPromptLimit: 1
        });
    }

    async run( msg, { welcomeText } ) {
        const settings = this.client.provider;

        if ( welcomeText === 'clear' ) {
            settings.remove( msg.guild, 'welcomeText' )
                .then( msg.channel.send( 'Welcome successfully removed.' ) );
            return;
        }

        if ( !settings.get( msg.guild, 'agreementChannel' ) && !settings.get(msg.guild, 'agreementSlim') ) { return msg.channel.send( `You need to set an agreement channel first with \`${msg.guild.commandPrefix}setagreementchannel\`.` ); }

        settings.set( msg.guild, 'welcomeText', welcomeText )
            .then( msg.channel.send( 'Welcome text successfully set.' ));
    }
};
