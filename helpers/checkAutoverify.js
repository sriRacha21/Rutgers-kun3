const { sendWelcomeMessage } = require('./sendWelcomeMessage')

function checkAutoverify( msg, settings ) {
    const autoverify = settings.get( msg.guild, `autoverify` )
    if( autoverify ) {
        const phrase = autoverify.phrase
        const agreementRole = autoverify.role
        if( msg.cleanContent.toLowerCase() == phrase ) {
            msg.member.addRole( agreementRole )
            sendWelcomeMessage( msg.guild, msg.author, settings.get( msg.guild, 'welcomeChannel' ), settings.get( msg.guild, 'welcomeText' ) )
            return true
        }
    }
    return false
}

exports.checkAutoverify = checkAutoverify