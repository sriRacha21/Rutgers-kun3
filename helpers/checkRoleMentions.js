const { startTimedMute } = require('./startTimedMute')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function checkRoleMentions( msg, settings ) {
    // return if the message is not in a guild
    if( !msg.guild )
        return

    // exit if member has the mention everyone permission
    if( msg.member.hasPermission( defaults.officer_permission ) )
        return

    // get the unpingable roles from the settings
    const unpingableRoleIDs = settings.get( msg.guild, `unpingableRoles` )
    if( !unpingableRoleIDs )
        return

    // check the message itself to see if theres a match between the roles mentioned in it and the unpingable roles list
    let mentionedRole = false
    msg.mentions.roles.forEach( role => {
        mentionedRole = unpingableRoleIDs.find( unpingableRoleID => unpingableRoleID == role.id )
    })

    // if a match is found, mute the user for the default mute time
    if( mentionedRole ) {
        startTimedMute( msg.member, settings, 'Mentioning a role that you were not allowed to mention', 4*60*60*1000 )
        // delete the message
        msg.delete()
        // turn the id into a role
        mentionedRole = msg.guild.roles.find( r => r.id == mentionedRole )
        // send out the name of the role that was mentioned to prevent ghost ping
        msg.channel.send( `The role ${mentionedRole.name} was mentioned in this channel.` )
    }
}


exports.checkRoleMentions = checkRoleMentions