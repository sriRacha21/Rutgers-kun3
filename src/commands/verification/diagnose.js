const Commando = require('discord.js-commando');
const fs = require('fs');
// JSON parsing
const path = require('path');
const permissionsPath = path.join(__dirname, '../../settings/permissions_settings.json');
const defaults = JSON.parse(fs.readFileSync(permissionsPath, 'utf-8'));
const apiKeys = fs.existsSync('settings/api_keys.json') ? JSON.parse(fs.readFileSync('settings/api_keys.json', defaults.encoding)) : { mailgun: '' };
const { domain } = fs.existsSync('settings/smtp_server.json') ? JSON.parse(fs.readFileSync('settings/smtp_server.json', 'utf-8')) : { host: null, port: null, domain: null, username: null, password: null };
// Requests
const bent = require('bent');
const getJSON = bent('json');
// Logging
const logger = require('../../logger');
// Needed misc scripts
const { isValidnetID } = require('../../helpers/isValidnetID');
// Output
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');

module.exports = class DiagnoseCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'diagnose',
            group: 'verification',
            memberName: 'diagnose',
            description: 'Diagnose issues with server verification.',
            userPermissions: [ defaults.admin_permission ],
            guildOnly: true,
            args: [
                {
                    key: 'member',
                    type: 'member',
                    prompt: 'Enter a member.'
                },
                {
                    key: 'netID',
                    type: 'string',
                    default: '',
                    prompt: 'Enter a netID to check for bounced email.'
                }
            ]
        });
    }

    async run( msg, { member, netID } ) {
        // check if server has verification of any kind
        const settings = this.client.provider;
        const globalSettings = this.client.settings;
        if (!settings.get(msg.guild, 'agreementChannel') && !settings.get(msg.guild, 'agreementSlim')) { return msg.channel.send("Your server does not have netID verification setup. You don't need to use this command."); }
        // find out what step user is on
        const user = member.user;
        const agreeObj = globalSettings.get(`agree:${user.id}`);
        // create embed
        const startEmbed = generateDefaultEmbed({
            author: 'Diagnosing verification issues for',
            title: user.tag,
            thumbnail: user.displayAvatarURL(),
            clientUser: this.client.user,
            msg: msg,
            guild: msg.guild
        });
        // start typing
        msg.channel.startTyping();
        // send embed-- prepare for edits
        const sentEmbed = await msg.channel.send(startEmbed);
        // fetch last 20 messages (needed for every step)
        if ( !user.dmChannel ) await user.createDM();
        if ( user.dmChannel.messages.cache.size < 20 ) await user.dmChannel.messages.fetch({ limit: 20 });
        const lastTwenty = user.dmChannel.messages.cache.last(20).reverse();
        // no setting-- user may have not started process or is already in server
        if (!agreeObj) {
            startEmbed.setDescription('No agreement object found in database. User may have not started the agreement process or is already in the server.');
            startEmbed.addField('Role size check:', member.roles.cache.size > 1 ? 'It appears the user has more than 1 role. They may already be in the server.' : 'The user is not yet in the server. They may not have started the verification process.');
            await sentEmbed.edit(startEmbed);
            if (member.roles.cache.size > 1) {
                startEmbed.addField('Diagnosis complete!:', 'It appears the user has entered the server. No further action will be taken.');
                await sentEmbed.edit(startEmbed);
                msg.channel.stopTyping();
                return;
            }

            // Was a dmChannel even opened? Do we share any messages?
            if ( user.dmChannel.messages.cache.size === 0 ) {
                const suggestion = user.lastMessage ? `Looks like their last message sent in the server was: ${user.lastMessage.cleanContent}.` : '';
                startEmbed.addField('Diagnosis complete!:', `I did not DM this user. It appears they may not have started the verification process. No further action will be taken.\n${suggestion}`);
                await sentEmbed.edit(startEmbed);
                msg.channel.stopTyping();
                return;
            } else {
                startEmbed.addField('DM Check:', "**Yes**, the user did receive a DM from me.\nThat's not supposed to happen.");
            }
            await sentEmbed.edit(startEmbed);
        } else if ( agreeObj.step === 1 || agreeObj.step === 2 ) {
            // Diagnose user DM's
            startEmbed.setDescription(`I think I DM'ed this user already. Here are my last ${lastTwenty.length} messages with ${user.tag}. Please scan them for anything that might look off:`);
            await sentEmbed.edit(startEmbed);
            // add fields
            lastTwenty.forEach(message => {
                startEmbed.addField(message.author.tag + ':', message.cleanContent && message.cleanContent.length < 500 ? message.cleanContent : '(nothing, there may have been an embed here)');
            });
            startEmbed.addField('Diagnosis complete!:', "My DM's with this user are above. Please scan them and see if anything looks off.");

            await sentEmbed.edit(startEmbed);
        } else if ( agreeObj.step === 3 ) {
            // prep embed
            startEmbed.setDescription("I think I already queued an email for this user. Let's see if it bounced.");
            await sentEmbed.edit(startEmbed);
            // Did the email bounce? Did it get suppressed?
            if (apiKeys.mailgun === '') {
                startEmbed.addField('Mailgun key check:', "I can't check the mailgun logs.");
                startEmbed.addField('Diagnosis complete!:', 'Consider asking the user to double-check their email. No further action will taken.');
                await startEmbed.edit(startEmbed);
                msg.channel.stopTyping();
                return;
            }
            if (netID === '') {
                startEmbed.addField('NetID check:', `No netID supplied. If you want to manually check a netID for a bounce, supply it as the second argument to this command.
I'll scan the last ${lastTwenty.length} messages for something that looks like a netID and try to use that.`);
                netID = lastTwenty
                    .filter(m => m.author.id === user.id)
                    .map(m => m.content)
                    .reverse()
                    .find(str => isValidnetID(str));
                if (netID) {
                    startEmbed.addField('NetID match found!:', `Checking bounces table for netID \`${netID}\`. If this doesn't look like a netID to you consider supplying it manually as a second argument.`);
                    await sentEmbed.edit(startEmbed);
                }
            }
            if (!netID) {
                startEmbed.addField('NetID not found:', "I couldn't find a netID. ");
                startEmbed.addField('Diagnosis complete!:', 'Double-check the DM exchange with the user to ensure they entered a valid netID. No further action will be taken.');
                await sentEmbed.edit(startEmbed);
                msg.channel.stopTyping();
                return;
            }

            const requestURL = `https://api:${apiKeys.mailgun}@api.mailgun.net/v3/${domain}/bounces/${netID}@scarletmail.rutgers.edu`;
            logger.log('info', `Requesting URL: ${requestURL} for diagnose command.`);
            getJSON(requestURL)
                .then(async body => {
                    startEmbed.addField('Bounce table check:', `NetID \`${netID}\` was found in the bounces table: \`\`\`json\n${JSON.stringify(body)}\n\`\`\` Attempting to delete entry...`);
                    await sentEmbed.edit(startEmbed);
                    // DELETE BOUNCE
                    const deleteSuppression = bent('DELETE', requestURL);
                    deleteSuppression()
                        .then(async() => {
                            startEmbed.addField('Success!:', `Successfully deleted netID \`${netID}\` from bounces table. `);
                            startEmbed.addField('Diagnosis complete!:', 'Ask user to restart agreement process and the email should send this time.');
                            await sentEmbed.edit(startEmbed);
                        }).catch(async() => {
                            startEmbed.addField('Failure:', `Failed to delete netID \`${netID}\` from bounces table.`);
                            startEmbed.addField('Diagnosis complete!:', `Emails will continue failing to send. Please contact ${this.client.owners[0].tag} in this server: ${this.client.invite}.`);
                            await sentEmbed.edit(startEmbed);
                        }).finally(() => {
                            msg.channel.stopTyping();
                        });
                }).catch(async() => {
                    startEmbed.addField('Not found.', `The netID \`${netID}\` was not found in the bounces table.`);
                    startEmbed.addField('Diagnosis complete!:', 'Ask the user to double-check their email. No further action will be taken.');
                    await sentEmbed.edit(startEmbed);
                    msg.channel.stopTyping();
                });
        }

        // stop typing
        msg.channel.stopTyping();
    }
};
