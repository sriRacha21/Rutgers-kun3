const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const logger = require('../logger')

function flushAgreements( guilds, provider ) {
    if( guilds ) {
        guilds.forEach( guild => {
            // attempt to get agreement channel from settings
            let maybeAgreementChannel = provider.get( guild, 'agreementChannel' );
            // skip this guild if its agreement channel does not exist
            if( !maybeAgreementChannel )
                return;
            // convert channel id to channel
            maybeAgreementChannel = guild.channels.cache.find(channel => channel.id == maybeAgreementChannel)
            // flush if it does
            maybeAgreementChannel.messages.fetch({limit: 100})
            .then( messages => {
                messages
                .filter( msg => !msg.webhookID && (msg.author.bot || (msg.member && !msg.member.hasPermission(defaults.admin_permission))) )
                .forEach( message => message.delete()
                    .catch(err => { 
                        if(err) {
                            logger.warn(`Couldn't delete message in the agreement channel of guild ${message.guild.name}.`);
                            // maybeAgreementChannel.send(`I'm not able to delete messages in this channel. You may want to either give me permission to delete messages here or the Admin permission.`)
                            // .then(m => setTimeout(() => m.delete(), 10000));
                        }
                    })
                )
            })
        })
    }
    setTimeout(flushAgreements, 15000, guilds, provider );
}

exports.flushAgreements = flushAgreements