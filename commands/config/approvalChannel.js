const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'))
const { oneLine } = require('common-tags')

module.exports = class SetApprovalChannelCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setapprovalchannel',
            group: 'config',
            memberName: 'approvalchannel',
            description: 'Configure the approval channel for this server.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'approvalChannel',
                    label: 'approval channel',
                    prompt: oneLine`Enter the channel you want to use to approve
user submitted content or \`clear\` if you want to reset the approval channel to its default value.`,
                    type: 'channel|string',
                }
            ],
            argsPromptLimit: 1,
        })
    }

    async run( msg, { approvalChannel } ) {
        const settings = this.client.provider

        if( typeof approvalChannel === 'object' )
            settings.set( msg.guild, `approvalChannel`, approvalChannel.id )
            .then( msg.channel.send( `Approval channel successfully set as ${approvalChannel}.` ) )
        else if( approvalChannel == 'clear' )
            settings.remove( msg.guild, `approvalChannel` )
            .then( msg.channel.send( `Approval channel successfully removed.` ) )
        else
            msg.channel.send(`Invalid input. Try again.`)
    }
}