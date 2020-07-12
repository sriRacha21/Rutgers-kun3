const Commando = require('discord.js-commando')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

module.exports = class SetAgreementEmote extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'setagreementemote',
            group: 'config',
            memberName: 'setagreementemote',
            description: `Configure a message to have an emote which, when clicked, will initiate the agreement process. Run '${client.commandoPrefix}clearAgreementEmotes' to clear the setting.`,
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'messageToBind',
                    label: 'Message ID to Bind Emote to',
                    prompt: 'Enter the ID of the message you want to bind the emote to.',
                    type: 'message'
                },
            ]
        })
    }
    
    async run( msg, { messageToBind } ) {
        return msg.channel.send("WIP!");
        
        const settings = this.client.provider

        if( !this.client.provider.get( msg.guild, 'agreementRoles' ) )
            return msg.channel.send( 'You need to set up the roles that a user can choose from when they agree to the server rules first.' )

        messageToBind.react(emoteToBind);

        settings.set( msg.guild, 'agreementMessageEmote', `${messageToBind.id}:${emoteToBind.id}` )
        .then( msg.channel.send( 'Agreement emote successfully bound.' ) );
    }
}