const Commando = require('discord.js-commando');
const { oneLine } = require('common-tags');
const fs = require('fs');
const { startAgreementProcess } = require('../../helpers/verification/agreeHelper');
const isSMTPServerSetup = fs.existsSync('settings/smtp_server.json');

module.exports = class AgreeCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'agree',
            group: 'verification',
            memberName: 'agree',
            description: 'Agree to the server rules.',
            guildOnly: true,
            hidden: true
        });
    }

    async run( msg ) {
        const agreementChannel = this.client.provider.get( msg.guild, 'agreementChannel' );
        const agreementRoleObjs = this.client.provider.get( msg.guild, 'agreementRoles' );

        // exit if there is no agreement channel set
        if ( !agreementChannel ) {
            return msg.channel.send( oneLine`The agreement channel 
was not set! Please tell an Admin to set it with \`${msg.guild.commandPrefix}setagreementchannel\` to use Rutgers-kun's Rutgers email verification system.` );
        }

        // exit if there are no agreement roles (roles given upon successful [or lack of] verification)
        if ( !agreementRoleObjs ) {
            return msg.channel.send( oneLine`The agreement roles
were not set! Please tell an Admin to set them with \`${msg.guild.commandPrefix}setagreementroles\` to user Rutgers-kun's email verification system.`);
        }

        // exit if there is an agreement channel set and this isn't it
        if ( agreementChannel && msg.channel.id !== agreementChannel ) {
            return msg.channel.send( oneLine`This isn't the agreement channel. 
If you want to designate this as the agreement channel please use \`${msg.guild.commandPrefix}setagreementchannel\`.` );
        }

        // exit if there is no SMTP server in the config file
        if ( !isSMTPServerSetup ) { return msg.channel.send( 'There is no SMTP server setup! Exiting...' ); }

        // begin user verification process
        // ask the user what role they want to add if there is more than one role configured
        startAgreementProcess(msg.author, msg.guild, this.client.provider, msg.channel);
    }
};
