// sending emails
const nodemailer = require('nodemailer')
const fs = require('fs')
const API_Keys = JSON.parse(fs.readFileSync('settings/api_keys.json', 'utf-8'))
const { generateVerificationCode } = require('./getRandom')
const { idsToValues } = require('./idsToValues')
const { isValidnetID } = require('./isValidnetID')
const { oneLine } = require('common-tags')
const { logger } = require('../logger')
const { inspect } = require('util')

function agreeHelper( msg, guilds, settings, provider ) {
    const agreementObj = settings.get( `agree:${msg.author.id}` )

    // ensure the user is in DM
    if( msg.guild )
        return

    // if the user hasn't started the verification process stop
    if( !agreementObj )
        return

    // deconstruct object
    const guildID = agreementObj.guildID
    const roleID = agreementObj.roleID
    const code = agreementObj.code
    const step = agreementObj.step
    
    // convert guildID to guild
    const guild = guilds.find( guild => guild.id == guildID )

    // get agreement roles
    // convert the role IDs to roles
    const agreementRoleObjs = provider.get( guild, `agreementRoles` )
    const agreementRoles = idsToValues( agreementRoleObjs.map(agreementRoleObj => agreementRoleObj.roleID), guild.roles )
    const agreementRoleToAdd = guild.roles.find( role => role.id == roleID )
    const permissionRoleObj = agreementRoleObjs.find(obj => obj.authenticate == 'permission')
    let permissionRole
    if( permissionRoleObj )
        permissionRole = guild.roles.find( role => role.id == permissionRoleObj.roleID )

    // if the user is on step 1, look for the role they want to add
    if( step == 1 ) {
        const maybeRoleName = msg.cleanContent.toLowerCase()
        // we need to validate the input, make sure its one of the roles
        // if the input does not match one of the role names (case ignored), exit
        if( !agreementRoles.map(role => role.name.toLowerCase()).includes(maybeRoleName) )
            return msg.author.send( `Your role did not match one of the listed roles. Please enter it again. Roles are ${agreementRoles.map(role => role.name).join(', ')}.` )
        // capture the role name, store it in the setting, prepare for next input
        const agreementRole = agreementRoles.find(role => role.name.toLowerCase() == maybeRoleName)
        // if the role id matches a non-authenticate, skip the other steps and give them that role
        if( agreementRoleObjs.filter(obj => obj.authenticate === 'false').map(obj => obj.roleID).includes(agreementRole.id) ) {
            const rolesToAdd = [agreementRole]
            if( permissionRole )
                rolesToAdd.push( permissionRole )
            guild.members.find( member => member.user.id == msg.author.id ).addRoles(rolesToAdd)
            return msg.author.send( `You have successfully been given the ${agreementRole.name} role in ${guild.name}!` )
        }
        // otherwise set the setting
        settings.set( `agree:${msg.author.id}`, {
            guildID: guild.id,
            roleID: agreementRole.id,
            step: 2
        })
        return msg.author.send( oneLine`Now enter your netID. Your netID is a unique identifier given to you by Rutgers that you use to sign in
to all your Rutgers services. It is generally your initials followed by a few numbers.` )
    }

    // if the user is on step 2, look for a netID
    if( step == 2 ) {
        const maybeNetID = msg.cleanContent.toLowerCase()
        // use regex to validate netid
        if( !isValidnetID(maybeNetID) )
            return msg.author.send( `This does not appear to be a valid netID. Please re-enter your netID.` )
        // turn the role ID into a role
        const role = guild.roles.find( role => role.id == roleID )
        // now that we know the netID is valid, send them an email with a verification code
        const transporter = nodemailer.createTransport({
            host: 'smtp.mailgun.org',
            port: 587,
            auth: {
                user: 'postmaster@mailgun.rutgersesports.com',
                pass: API_Keys.smtp_password,
            }
        })
        const verificationCode = generateVerificationCode()
        const emailInfo = {
            from: 'server-verification@mailgun.rutgersesports.com',
            to: `${maybeNetID}@scarletmail.rutgers.edu`,
            subject: `Verify your ${role.name} role in ${guild.name}!`,
            text: `Your verification code is:\n${verificationCode}`
        }
        transporter.sendMail(emailInfo)
        .then( () => {
            msg.author.send(`Email successfully sent! Please check your school email for a verification code and enter it here to verify your identity.`)
            logger.log( 'info', `Email successfully sent! Info: ${inspect(emailInfo)}` )
        })

        // now that we've sent the verification code, wrap up by storing what happened in the settings and prepare for the final input
        settings.set( `agree:${msg.author.id}`, {
            guildID: guild.id,
            roleID: roleID,
            code: verificationCode,
            step: 3
        })
    }

    if( step == 3 ) {
        const maybeVerificationCode = msg.cleanContent.toLowerCase()
        // compare the code to that from the object
        if( maybeVerificationCode != code )
            return msg.author.send( `That doesn't appear to be the right verification code. Make sure you're entering or copy/pasting it correctly.` )
        // now that we know the codes match, grant the role
        const rolesToAdd = [agreementRoleToAdd]
        if( permissionRole )
            rolesToAdd.push(permissionRole)
        guild.members.find( member => member.user.id == msg.author.id ).addRoles(rolesToAdd)
        // clean the database
        settings.remove( `agree:${msg.author.id}` )
        return msg.author.send( `You have successfully been given the ${agreementRoleToAdd.name} role in ${guild.name}!` )
    }
}

exports.agreeHelper = agreeHelper