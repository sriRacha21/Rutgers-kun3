const Commando = require('discord.js-commando');
const fs = require('fs');
// JSON parsing
const defaults = JSON.parse(fs.readFileSync('settings/permissions_settings.json', 'utf-8'));
const API_Keys = fs.existsSync('settings/api_keys.json') ? JSON.parse(fs.readFileSync('settings/api_keys.json', defaults.encoding)) : {mailgun:''};
const { host, port, domain, username, password } = fs.existsSync('settings/smtp_server.json') ? JSON.parse(fs.readFileSync('settings/smtp_server.json', 'utf-8')) : { host: null, port: null, domain: null, username: null, password: null };
// Requests
const bent = require('bent');
const getJSON = bent('json');
// Logging
const logger = require('../../logger');
// Needed misc scripts
const { isValidnetID } = require('../../helpers/isValidnetID');
const { request } = require('http');

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
        })
    }

    async run( msg, { member, netID } ) {
        // check if server has verification of any kind
        const settings = this.client.provider;
        if(!settings.get(msg.guild, 'agreementChannel') && !settings.get(msg.guild, 'agreementSlim'))
            return msg.channel.send("Your server does not have netID verification setup. You don't need to use this command.");
        // start typing
        msg.channel.startTyping();
        const user = member.user;
        // Was a dmChannel even opened? Do we share any messages?
        await msg.channel.send('**Step 1.** Did the user receive a DM from the bot at all?');
        if( !user.dmChannel ) await user.createDM();
        if( user.dmChannel.messages.cache.size < 20 ) await user.dmChannel.messages.fetch({limit: 20});
        if( user.dmChannel.messages.cache.size == 0 ) {
            const suggestion = user.lastMessage ? `Looks like their last message sent in the server was: ${user.lastMessage.cleanContent}.` : '';
            await msg.channel.send(`I did not DM this user. It appears they may not have started the verification process. ${suggestion}`);
            msg.channel.stopTyping();
            return;
        } else {
            await msg.channel.send("**Yes**, the user did receive a DM from me.");
        }
        // Diagnose user DM's
        const lastTwenty = user.dmChannel.messages.cache.last(20).reverse();
        let stepTwo = `**Step 2.** Did they DM the bot the right thing? Here are my last ${lastTwenty.length} messages with ${user.tag}:\n\n`;
        lastTwenty.forEach(message => {
            stepTwo += `**${message.author.tag}**: ${message.cleanContent}\n`;
        })
        await msg.channel.send(stepTwo, {split:true})
        .catch(err => {
            msg.channel.send("I was unable to fetch the last 20 messages with this user. Consider asking the user you are diagnosing for a screenshot of their DM's with the bot.");
        });
        // Did the email bounce? Did it get suppressed?
        if(API_Keys.mailgun==='') {
            msg.channel.stopTyping();
            return;
        }
        await msg.channel.send("**Step 3.** Did the user's email bounce?");
        if(netID==='') {
            await msg.channel.send(`No netID supplied. If you want to manually check a netID for a bounce, supply it as the second argument to this command.
I'll scan the last ${lastTwenty.length} messages for something that looks like a netID and try to use that.`);
            netID = lastTwenty
                .filter(m=>m.author.id==user.id)
                .map(m=>m.content)
                .find(str=>isValidnetID(str));
            if(netID)
                await msg.channel.send(`Match found. Checking bounces table for netID \`${netID}\`. If this doesn't look like a netID to you consider supplying it manually as a second argument.`);
        }
        if(!netID) {
            await msg.channel.send("I couldn't find a netID. Double-check the DM exchange with the user to ensure they entered a valid netID.");
            msg.channel.stopTyping();
            return;
        }
        
        const requestURL = `https://api:${API_Keys.mailgun}@api.mailgun.net/v3/${domain}/bounces/${netID}@scarletmail.rutgers.edu`;
        logger.log('info', `Requesting URL: ${requestURL} for diagnose command.`);
        getJSON(requestURL)
        .then(async body => {
            await msg.channel.send(`NetID \`${netID}\` was found in the bounces table: \`\`\`json\n${JSON.stringify(body)}\n\`\`\``);
            // DELETE BOUNCE
            const deleteSuppression = bent('DELETE', requestURL);
            deleteSuppression()
            .then(async res => {
                await msg.channel.send(`Successfully deleted netID \`${netID}\` from bounces table. Ask user to restart agreement process and the email should send this time.`);
            }).catch(async err => {
                await msg.channel.send(`Failed to delete netID \`${netID}\` from bounces table. Emails will continue failing to send. Please contact ${this.client.owners[0].tag} in this server: ${this.client.invite}.`);
            })
        }).catch(async err => {
            await msg.channel.send(`The netID \`${netID}\` was not found in the bounces table.`);
        })

        // stop typing
        msg.channel.stopTyping();
    }
}