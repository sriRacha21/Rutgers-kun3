const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { implementApprovalPolicy } = require('./implementApprovalPolicy')
const RichEmbed = require('discord.js').RichEmbed
const { oneLine } = require('common-tags')

function checkProtectedRole( oldM, newM, settings, clientUser ) {
    const protectedRoles = settings.get( oldM.guild, `protectedRoles` )
    const approvalChannel = settings.get( oldM.guild, `approvalChannel` )
    // if there is a change in roles
    if( protectedRoles && approvalChannel && !oldM.roles.equals( newM.roles ) ) {
        const role = newM.roles.find( newR => !oldM.roles.array().includes(newR) )
        // find the changed role, and if it exists do something
        if( role ) {
            // if the role being added is the one being assigned by the bot leave (stop infinite loop)
            if( settings.get( oldM.guild, `protectedRoleReq:${oldM.user.id}:${role.id}` ) ) {
                settings.remove( oldM.guild, `protectedRoleReq:${oldM.user.id}:${role.id}` )
                return
            }
            // if the role id is one of the protected roles remove it and save it
            if( protectedRoles.includes(role.id) ) {
                implementApprovalPolicy({
                    type: 'protected role',
                    submissionName: `@${role.name}`,
                    permission: defaults.trusted_permission,
                    member: newM,
                    runNoPerms: () => {
                        newM.removeRole( role )
                        newM.user.send( oneLine`Mods will verify if you need this protected role. 
You will be notified by DM and the role will be assigned to you automatically if you are approved.` )
                        settings.set( oldM.guild, `protectedRoleReq:${oldM.user.id}:${role.id}`, true )
                    },
                    runHasPerms: () => {
                        newM.addRole( role )
                    },
                    settings: settings,
                    errChannel: approvalChannel
                },
                {
                    title: newM.user.tag,
                    clientUser: clientUser,
                    guild: oldM.guild,
                    startingEmbed: new RichEmbed()
                        .addField( 'Protected role add:', role )
                })
            }
        }
    }
}


exports.checkProtectedRole = checkProtectedRole