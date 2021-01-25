const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'))
const { oneLine } = require('common-tags')

module.exports = class SetModChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setmodchannel',
            group: 'config',
            memberName: 'modchannel',
            description: 'Configure the moderation logging channel for this server.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'modChannel',
                    label: 'mod channel',
                    prompt: oneLine`Enter the channel you want to use to log moderator
actions or \`clear\` if you want to reset the approval channel to its default value.`,
                    type: 'channel|string',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { modChannel } ) {
        const settings = this.client.provider

        if( typeof modChannel === 'object' )
            settings.set( msg.guild, `modChannel`, modChannel.id )
            .then( msg.channel.send( `Moderation logging channel successfully set as ${modChannel}.` ) )
        else if( modChannel == 'clear' )
            settings.remove( msg.guild, `modChannel` )
            .then( msg.channel.send( `Moderation logging channel successfully removed.` ) )
        else
            msg.channel.send(`Invalid input. Try again.`)
    }
}