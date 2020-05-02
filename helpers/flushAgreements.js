const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const logger = require('../logger')

function flushAgreements( guilds, provider ) {
    if( guilds ) {
        guilds.forEach( guild => {
            // attempt to get agreement channel from settings
            let maybeAgreementChannel = provider.get( guild, 'agreementChannel' )
            // skip this guild if its agreement channel does not exist
            if( !maybeAgreementChannel )
                return
            // convert channel id to channel
            maybeAgreementChannel = guild.channels.find(channel => channel.id == maybeAgreementChannel)
            // flush if it does
            maybeAgreementChannel.fetchMessages()
            .then( messages => {
                messages
                .filter( msg => !msg.webhookID && (msg.author.bot || (msg.member && !msg.member.hasPermission(defaults.admin_permission))) )
                .forEach( message => message.delete()
                    .catch(err => { if(err) logger.warn(`Couldn't delete message in the agreement channel of guild ${message.guild.name}.`) } ) )
            })
        })
    }
    setTimeout(flushAgreements, 15000, guilds, provider )
}

exports.flushAgreements = flushAgreements