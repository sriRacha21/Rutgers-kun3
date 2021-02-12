// sending emails
const nodemailer = require('nodemailer');
const fs = require('fs');
const smtpServer = fs.existsSync('settings/smtp_server.json') ? JSON.parse(fs.readFileSync('settings/smtp_server.json', 'utf-8')) : null;
const { generateVerificationCode } = require('./getRandom');
const { idsToValues } = require('./idsToValues');
const { isValidnetID } = require('./isValidnetID');
const { sendWelcomeMessage } = require('./sendWelcomeMessage');
const { oneLine } = require('common-tags');
const logger = require('../logger');
const { inspect } = require('util');

async function agreeHelper( msg, guilds, settings, provider ) {
    const agreementObj = settings.get( `agree:${msg.author.id}` );

    // ensure the SMTP server is setup
    if ( !smtpServer ) return;

    // ensure the user is in DM
    if ( msg.guild ) { return; }

    // if the user hasn't started the verification process stop
    if ( !agreementObj ) { return; }

    // deconstruct object
    const guildID = agreementObj.guildID;
    const roleID = agreementObj.roleID;
    const code = agreementObj.code;
    const netID = agreementObj.netID;
    const step = agreementObj.step;
    const nowelcome = agreementObj.nowelcome;
    const removerole = agreementObj.removerole;

    // convert guildID to guild
    const guild = guilds.find( guild => guild.id === guildID );

    // get agreement roles
    // convert the role IDs to roles
    const agreementRoleObjs = provider.get( guild, 'agreementRoles' );
    const agreementRoles = agreementRoleObjs ? idsToValues( agreementRoleObjs.map(agreementRoleObj => agreementRoleObj.roleID), guild.roles.cache ) : null;
    const agreementRoleToAdd = guild.roles.cache.find( role => role.id === roleID );
    const permissionRoleObj = agreementRoleObjs ? agreementRoleObjs.find(obj => obj.authenticate === 'permission') : null;
    let permissionRole;
    if ( permissionRoleObj ) { permissionRole = guild.roles.cache.find( role => role.id === permissionRoleObj.roleID ); }

    // if the user is on step 1, look for the role they want to add
    if ( step === 1 ) {
        const maybeRoleName = msg.cleanContent.toLowerCase();
        // we need to validate the input, make sure its one of the roles
        // if the input does not match one of the role names (case ignored), exit
        if ( !agreementRoles.map(role => role.name.toLowerCase()).includes(maybeRoleName) && permissionRoleObj ) { return msg.author.send( `Your role did not match one of the listed roles. Please enter it again. Roles are ${agreementRoles.filter(r => r.id !== permissionRoleObj.roleID).map(role => role.name).join(', ')}.` ); }
        // capture the role name, store it in the setting, prepare for next input
        const agreementRole = agreementRoles.find(role => role.name.toLowerCase() === maybeRoleName);
        // guard clause
        if ( !agreementRole ) {
            logger.warn(`Agreement role was not found in guild ${guild.name}!`);
            return;
        }
        // if the role id matches a non-authenticate, skip the other steps and give them that role
        if ( agreementRoleObjs.filter(obj => obj.authenticate === 'false').map(obj => obj.roleID).includes(agreementRole.id) ) {
            const rolesToAdd = [agreementRole];
            if ( permissionRole ) { rolesToAdd.push( permissionRole ); }
            // fetch the member from the guild
            await guild.members.fetch(msg.author.id);
            const guildMember = guild.members.cache.find( member => member.user.id === msg.author.id );
            if ( guildMember ) {
                guildMember.roles.add(rolesToAdd)
                    .then(m => {
                        if ( removerole ) { m.roles.remove(removerole); }
                    });
            } else {
                msg.author.send('You could not be found in the server you started agreeing in. Please go back to that server and type `!agree` or click on the emote again.');
                return;
            }
            settings.remove( `agree:${msg.author.id}` );
            if ( !nowelcome ) { sendWelcomeMessage( guild, msg.author, provider.get( guild, 'welcomeChannel'), provider.get( guild, 'welcomeText' ) ); }
            return msg.author.send( `You have successfully been given the ${agreementRole.name} role in ${guild.name}!` );
        }
        // otherwise set the setting
        settings.set( `agree:${msg.author.id}`, {
            guildID: guild.id,
            roleID: agreementRole.id,
            step: 2
        });
        return msg.author.send( oneLine`Now enter your netID. Your netID is a unique identifier given to you by Rutgers that you use to sign in
to all your Rutgers services. It is generally your initials followed by a few numbers.` );
    }

    // if the user is on step 2, look for a netID
    if ( step === 2 ) {
        const maybeNetID = msg.cleanContent.toLowerCase();
        // use regex to validate netid
        if ( !isValidnetID(maybeNetID) ) { return msg.author.send( 'This does not appear to be a valid netID. Please re-enter your netID.' ); }
        // turn the role ID into a role
        const role = guild.roles.cache.find( role => role.id === roleID );
        // check if the net id is in our file of already verified netids
        if ( fs.existsSync('settings/netids.json') ) {
            const netIDsObj = JSON.parse(fs.readFileSync('settings/netids.json', 'utf-8'));
            if ( netIDsObj[msg.author.id] === maybeNetID ) {
                const agreementRole = agreementRoles ? agreementRoles.find(role => role.id === roleID) : role;
                const rolesToAdd = [agreementRole];
                if ( permissionRole && !nowelcome ) { rolesToAdd.push(permissionRole); }
                // fetch the member from the guild
                await guild.members.fetch(msg.author.id);
                const guildMember = guild.members.cache.find( member => member.user.id === msg.author.id );
                if ( guildMember ) {
                    guildMember.roles.add(rolesToAdd)
                        .then(m => {
                            if ( removerole ) { m.roles.remove(removerole); }
                        });
                } else {
                    msg.author.send('You could not be found in the server you started agreeing in. Please go back to that server and type `!agree` or click on the emote again.');
                    return;
                }
                settings.remove( `agree:${msg.author.id}` );
                if ( !nowelcome ) { sendWelcomeMessage( guild, msg.author, provider.get( guild, 'welcomeChannel' ), provider.get( guild, 'welcomeText' ) ); }
                return msg.author.send( `Your netID has already been verified! You have successfully been given the ${agreementRole.name} role in ${guild.name}!` );
            }
        }
        // now that we know the netID is valid, send them an email with a verification code
        const transporter = nodemailer.createTransport({
            host: smtpServer.host,
            port: smtpServer.port ? smtpServer.port : 587,
            auth: {
                user: smtpServer.username,
                pass: smtpServer.password
            }
        });
        const verificationCode = generateVerificationCode();
        const emailInfo = {
            from: `server-verification@${smtpServer.domain}`,
            to: `${maybeNetID}@scarletmail.rutgers.edu`,
            subject: `Verify your ${role.name} role in ${guild.name}!`,
            html: `Your verification code is:<br><code style="font-size:2.5em;line-height:2em">${verificationCode}</code>`
        };
        const toEdit = await msg.author.send('Attempting to send email...');
        transporter.sendMail(emailInfo, (err, info) => {
            logger.log('info', `Email sent: ${inspect(info)}
${inspect(err)}`);
            if ( err ) {
                toEdit.edit(`An error was encountered sending the email. You may have entered your netID incorrectly. Please try again or contact sriRacha#1999 in this server: https://discord.gg/YDEpNDV
${err}`);
                logger.log('error', err);
            } else {
                toEdit.edit(`Email successfully queued. Please check your school email for a verification code and enter it here to verify your identity.
If you still haven't received an email, you may have entered your netID incorrectly.`);
                logger.log( 'info', `Email successfully sent! Info: ${inspect(emailInfo)}` );

                // now that we've sent the verification code, wrap up by storing what happened in the settings and prepare for the final input
                const agreementObjTwo = {
                    guildID: guild.id,
                    roleID: roleID,
                    code: verificationCode,
                    netID: maybeNetID,
                    step: 3
                };
                if ( nowelcome ) { agreementObjTwo.nowelcome = true; }
                if ( removerole ) { agreementObjTwo.removerole = removerole; }
                settings.set( `agree:${msg.author.id}`, agreementObjTwo );
            }
        });
    }

    if ( step === 3 ) {
        const maybeVerificationCode = msg.cleanContent.toLowerCase();
        // compare the code to that from the object
        if ( maybeVerificationCode !== code ) { return msg.author.send( 'That doesn\'t appear to be the right verification code. Make sure you\'re entering or copy/pasting it correctly.' ); }
        // now that we know the codes match, grant the role
        const rolesToAdd = [agreementRoleToAdd];
        if ( permissionRole && !nowelcome ) { rolesToAdd.push(permissionRole); }
        const guildMember = guild.members.cache.find( member => member.user.id === msg.author.id );
        if ( guildMember ) {
            guildMember.roles.add(rolesToAdd)
                .then(m => {
                    if ( removerole ) { m.roles.remove(removerole); }
                });
        } else {
            msg.author.send('You could not be found in the server you started agreeing in. Please go back to that server and type `!agree` or click on the emote again.');
            return;
        }
        // send welcome message
        if ( !nowelcome ) { sendWelcomeMessage( guild, msg.author, provider.get( guild, 'welcomeChannel' ), provider.get( guild, 'welcomeText' ) ); }
        // save the email to a file
        if ( fs.existsSync('settings/netids.json') ) {
            const netIDsObj = JSON.parse(fs.readFileSync('settings/netids.json', 'utf-8'));
            netIDsObj[msg.author.id] = netID;
            fs.writeFileSync('settings/netids.json', JSON.stringify(netIDsObj));
        }
        // clean the database
        settings.remove( `agree:${msg.author.id}` );
        return msg.author.send( `You have successfully been given the ${agreementRoleToAdd.name} role in ${guild.name}!` );
    }
}

exports.agreeHelper = agreeHelper;
