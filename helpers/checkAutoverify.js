const { sendWelcomeMessage } = require('./sendWelcomeMessage')

function checkAutoverify( msg, settings ) {
    const autoverify = settings.get( msg.guild, 'autoverify' )
    const permRole = settings.get( msg.guild, 'agreementRoles' ).find(ar => ar.authenticate == 'permission')
    if( autoverify ) {
        autoverify.forEach(av => {
            const phrase = av.phrase
            const rolesToAdd = []
            rolesToAdd.push( av.role )
            if( permRole )
                rolesToAdd.push( permRole.roleID )
            if( msg.cleanContent.toLowerCase() == phrase ) {
                msg.delete()
                msg.member.addRoles( rolesToAdd )
                sendWelcomeMessage( msg.guild, msg.author, settings.get( msg.guild, 'welcomeChannel' ), settings.get( msg.guild, 'welcomeText' ) )
                return true
            }
        })
    }
    return false
}

exports.checkAutoverify = checkAutoverify