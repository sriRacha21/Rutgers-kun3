const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function flushLiveRoles( guilds, provider ) {
    if( guilds ) {
        guilds.forEach( guild => {
            // attempt to get agreement channel from settings
            const maybeLiveRoleID = provider.get( guild, 'liveRole' )
            // skip this guild if its agreement channel does not exist
            if( !maybeLiveRoleID )
                return
            // get users in the guild with the live role and remove it from them if they have it
            const membersWLiveRole = guild.members.filter( m => !!m.roles.find(r => r.id == maybeLiveRoleID) )
            membersWLiveRole.forEach( m => {
                const isStreaming = m.presence.game && m.presence.game.streaming
                if( !isStreaming )
                    m.removeRole( maybeLiveRoleID )
            })
        })
    }
    setTimeout(flushLiveRoles, 60*1000, guilds, provider )
}

exports.flushLiveRoles = flushLiveRoles