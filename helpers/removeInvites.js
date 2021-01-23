const logger = require('../logger')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function removeInvites( msg, client ) {
    if( !msg.guild )
        return;

    const removeInvites = client.provider.get( msg.guild, 'removeInvites' );

    const universalInvOverrides = [
        '143013824679641088', // rutgers esports
        '409134033898045470', // rutgers computer science
        '531342782338433024', // rutgers playground
        '682667655043350528', // RU Mathcord
        '572965432890490900', // scarlet smash
        '643670268404826142', // league of legends
        '277296577469612033', // pokemon
        '430957374124326913', // rainbow 6
        '692027761081974925', // RU economics
    ]

    if( removeInvites ) {
        let inviteMatches = msg.content.match( /discord(app)?.(gg|com)\/(invite\/)?([a-z]|[A-Z]|[0-9])+/gi )
        if( inviteMatches ) {
            inviteMatches.forEach( inviteMatch => {
                client.fetchInvite(inviteMatch)
                .then( invite => {
                    if( universalInvOverrides.includes(invite.guild.id) )
                        return;
                    if( !msg.member.hasPermission(defaults.trusted_permission) ) {
                        msg.delete();
                        msg.author.send(`Sending server invites is not allowed in ${msg.guild.name}.`);
                    }
                })
                .catch( err => {
                    if( err )
                        logger.log( 'warn', `Unable to resolve invite ${inviteMatch}. Error: ${err}` ) ;
                })
            })
        }
    }
}

exports.removeInvites = removeInvites;