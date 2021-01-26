const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'))

module.exports = class SetAutoVerifyCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setautoverify',
            group: 'config',
            memberName: 'autoverify',
            description: 'Configure a word or phrase that can be used to bypass the verification process.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'phrase',
                    prompt: 'Enter the phrase you want users to enter in your agreement channel to skip the verification process.',
                    type: 'string',
                    parse: str => str.toLowerCase()
                },
                {
                    key: 'role',
                    prompt: 'Enter the role you want users to be granted when they type in the phrase. Enter `clear` to clear the setting.',
                    type: 'role|string'
                }
            ],
        })
    }

    async run( msg, { phrase, role } ) {
        const settings = this.client.provider

        if( role === 'clear' ) {
            settings.remove( msg.guild, `autoverify` )
            .then( msg.channel.send(`Autoverify phrase successfully cleared.`) )
            return
        }

        if( !settings.get( msg.guild, `agreementChannel` ) )
            return msg.channel.send( `You need to designate an agreement channel with \`${msg.guild.commandPrefix}setagreementchannel\` first.` )

        if( !settings.get( msg.guild, `agreementRoles` ) )
            return msg.channel.send( `You need to designate agreement roles with \`${msg.guild.commandPrefix}setagreementroles\` first.` )

        // check if the passed role is marked as true in the agreement roles
        const agreementRoles = settings.get(msg.guild, `agreementRoles`)
        if( !agreementRoles.filter(r => r.authenticate === 'true').map(r => r.roleID).includes(role.id) )
            return msg.channel.send( `The role you are passing must be marked as requiring verification (\`true\`). Check your configs. (\`${msg.guild.commandPrefix}configs\`)` )

        const autoverify = settings.get(msg.guild, `autoverify`);
        let avProm;
        if( autoverify ) {
            autoverify.push({
                phrase: phrase,
                role: role.id
            });
            avProm = settings.set(msg.guild, `autoverify`, autoverify);
        } else {
            avProm = settings.set(msg.guild, `autoverify`, [
                {
                    phrase: phrase,
                    role: role.id,
                }
            ]);
        }
        avProm.then( msg.channel.send( `Autoverify phrase successfully set.` ) )
	}
}
