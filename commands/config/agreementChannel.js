const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetAgreementChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setagreementchannel',
            group: 'config',
            memberName: 'agreementchannel',
            description: 'Configure the agreement channel for this server. Just enter \`clear\` to clear the setting.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'agreementChannel',
                    label: 'agreement channel',
                    prompt: `Enter the channel you want to use for users to see before they see the rest of the server.`,
                    type: 'channel|string',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { agreementChannel } ) {
        const settings = this.client.provider

        if( typeof agreementChannel === 'object' )
            settings.set( msg.guild, `agreementChannel`, agreementChannel.id )
            .then( msg.channel.send( `Agreement channel successfully set as ${agreementChannel}.` ) )
        else if( agreementChannel === 'clear' )
            settings.remove( msg.guild, `agreementChannel` )
            .then( msg.channel.send( `Agreement channel successfully removed.` ) )
        else
            msg.channel.send(`Invalid input. Try again.`)
    }
}