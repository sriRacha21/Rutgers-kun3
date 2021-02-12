const Commando = require('discord.js-commando');
const { oneLine } = require('common-tags');
const { idsToValues } = require('../../helpers/idsToValues');
const fs = require('fs');
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
        // turn role ID's into roles
        const agreementRoles = idsToValues( agreementRoleObjs.filter(obj => obj.authenticate !== 'permission').map(obj => obj.roleID), msg.guild.roles.cache );
        // ask the user what role they want to add if there is more than one role configured
        msg.author.send( `Please enter the name of the role you want to add. Roles are: ${agreementRoles.map(agreementRole => agreementRole.name).join(', ')}.` )
            .then( () => {
                // capture the user's user ID so we can continue the conversation. Set that we're at step 1
                this.client.settings.set( `agree:${msg.author.id}`, {
                    guildID: msg.guild.id,
                    step: 1
                });
            })
            .catch( err => {
                if ( err ) {
                    msg.channel.send(`Error: \`${err}\`
This may have happened because you are not accepting DM's.
Turn on DM's from server members:`, { files: ['resources/setup-images/instructions/notif_settings.png', 'resources/setup-images/instructions/dms_on.png'] });
                }
            });
    }
};
