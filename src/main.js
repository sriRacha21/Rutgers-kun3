/*        IMPORTS AND GENERAL SETUP        */
// import sqlite to use as SettingsProvider
const sqlite = require('sqlite');
// import path to join paths in a platform-dependent way
const path = require('path');
// prepare to read in data from JSON files
const fs = require('fs');
const defaultSettingsPath = path.join(__dirname, '../settings/default_settings.json');
const defaults = fs.existsSync(defaultSettingsPath) ? JSON.parse(fs.readFileSync(defaultSettingsPath, 'utf-8')) : { err: true };
// read in data from JSON file containing default settings for the bot (ClientOptions object)
const botSettingsPath = path.join(__dirname, '../settings/bot_settings.json');
const ClientOptions = JSON.parse(fs.readFileSync(botSettingsPath, defaults.encoding));
// read in data from JSON file containing API keys
const apiKeysPath = path.join(__dirname, '../settings/api_keys.json');
const apiKeys = fs.existsSync(apiKeysPath) ? JSON.parse(fs.readFileSync(apiKeysPath, defaults.encoding)) : { token: '' };
// get methods for event helpers
const { setCommandFields } = require('./helpers/setCommandFields');
const { latexInterpreter, getLatexMatches } = require('./helpers/latexInterpreter');
const { parseApprovalReaction } = require('./helpers/implementApprovalPolicy');
const { parseCustomCommand } = require('./helpers/parseCustomCommand');
const { rutgersChan } = require('./helpers/rutgersChan');
const { reroll } = require('./helpers/reroll');
const { checkWordCount } = require('./helpers/checkWordCount');
const { objToEmailBody } = require('./helpers/objToEmailBody');
const { detectChain, saveMsgChainTable, loadMsgChainTable } = require('./helpers/detectChain');
const { agreeHelper } = require('./helpers/agreeHelper');
const { flushAgreements } = require('./helpers/flushAgreements');
const { flushAgreementEmotes } = require('./helpers/flushAgreementEmotes');
const { flushMessagesToCache } = require('./helpers/flushMessagesToCache');
const { logEvent } = require('./helpers/logEvent');
const { checkAutoverify } = require('./helpers/checkAutoverify');
const { sendRoleResponse } = require('./helpers/sendRoleResponse');
const { generatePresence } = require('./helpers/generatePresence');
const { reactionListener } = require('./helpers/reactionListener');
const { removeInvites } = require('./helpers/removeInvites');
// set up winston logging
const logger = require('./logger');
// detailed log of objects
const { inspect } = require('util');
// get some Discord fields we need
const RichEmbed = require('discord.js').MessageEmbed;
// initialize the Discord client
const Commando = require('discord.js-commando');
const Client = new Commando.Client(ClientOptions);
Client.invite = ClientOptions.invite;
// don't stop on expired certificate
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/*        EVENTS        */
// emitted on error, warn, debug
Client.on('error', (error) => {
    // log the error (email as well)
    logger.log('error', `<b>Error</b>: ${error.name}: ${error.message}
Stacktrace: ${error.stack}`);
});
Client.on('commandError', (command, err, message, args, fromPattern, result) => {
    const emailBody = {
        command: `${command.groupID}:${command.memberName} or ${command.name}`,
        error: `${err.name}: ${err.message}`,
        stackTrace: err.stack,
        arguments: args,
        fromPattern: fromPattern
    };
    if (message.guild) emailBody.guild = message.guild.name;
    logger.log('error', objToEmailBody(emailBody));
});
Client.on('warn', (info) => logger.log('warn', info));
Client.on('debug', (info) => logger.log('debug', info));
Client.on('disconnect', () => logger.warn('Websocket disconnected!'));
Client.on('reconnecting', () => logger.warn('Websocket reconnecting...'));

// emitted on bot being ready to operate
Client.on('ready', () => {
    logger.log('info', `Logged onto as ${Client.user.tag}${` at ${new Date(Date.now())}.`}`);
    // output warning on no defaults found
    if (defaults.err) { logger.log('error', 'No default_settings.json file was found. Unintended behavior may occur. Make sure you rename ../settings/default_settings.json.dist to ../settings/default_settings.json.'); }
    // periodically refresh command settings
    setCommandFields(Client.registry);
    // peridiocally update the bot's status
    generatePresence(Client, 0);
});

// when the settings provider is ready
Client.on('providerReady', () => {
    // retrieve messages from the cache
    const messagesToCache = Client.settings.get('messagesToCache') ? Client.settings.get('messagesToCache') : [];
    messagesToCache.forEach(msgAndChannel => {
        const channel = Client.channels.cache.get(msgAndChannel.channel);
        if (channel) {
            channel.messages.fetch(msgAndChannel.message)
                .then(m => {
                    logger.log('info', `Cached message ID ${m.id} from guild ${m.guild.name} (#${m.channel.name})`);
                })
                .catch(e => {
                    if (e && e.name === 'DiscordAPIError') {
                        messagesToCache.splice(messagesToCache.indexOf({ channel: msgAndChannel.channel, message: msgAndChannel.message }), 1);
                        Client.settings.set('messagesToCache', messagesToCache);
                    }
                });
        } else {
            logger.warn(`Channel ID ${msgAndChannel.channel} could not be found!`);
        }
    });
    // load chains
    loadMsgChainTable(Client.channels, Client.settings);
    // periodically flush messages in #agreement in all servers
    flushAgreements(Client.guilds.cache, Client.provider);
    // periodicially flush agreement emotes
    flushAgreementEmotes(Client.channels, Client.settings);
    // flush out unfindable channels from messagesToCache once
    flushMessagesToCache(Client.channels, Client.settings);
});

// emitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if (msg.author.bot) { return; }

    // delete messages in #agreement if they're made by non-admins or bots
    if (msg.guild) {
        const agreementChannel = Client.provider.get(msg.guild, 'agreementChannel');
        if (agreementChannel === msg.channel.id) {
            // ESCAPE and give the user their role if they entered the autoverify code
            if (checkAutoverify(msg, Client.provider)) return;
            if ((!msg.webhookID && msg.author.id === Client.user.id) || (msg.member && !msg.member.hasPermission(defaults.admin_permission))) {
                if (msg.content !== `${msg.guild.commandPrefix}agree`) {
                    msg.channel.send(`Please make sure you send \`${msg.guild.commandPrefix}agree\`. You sent \`${msg.cleanContent}\`.`)
                        .then(m => setTimeout(() => { m.delete(); }, 10000));
                }
                msg.delete();
            }
        }
    }

    // agreement process, we need the settings and settingsprovider to access guild and universal settings
    agreeHelper(msg, Client.guilds.cache, Client.settings, Client.provider);
    // if the member is ignored leave
    if (msg.guild && msg.member && Client.provider.get(msg.guild, `ignored:${msg.channel.id}`)) { return; }
    // remove server invite links
    removeInvites(msg, Client);
    // parse a custom command if the message starts with it, send the first word after the prefix to the method
    if (msg.cleanContent.startsWith(msg.guild && msg.guild.commandPrefix)) {
        parseCustomCommand(msg
            .cleanContent
            .toLowerCase()
            .split(' ')[0]
            .substring(msg.guild.commandPrefix.length), msg.cleanContent.split(' ').slice(1), Client.provider, msg.channel
        );
    }
    // check if message contains latex formatting
    latexInterpreter(msg, msg.channel);
    // check if word counters need to be incremented
    if (!msg.guild || (!Client.provider.get(msg.guild, 'wordCounters') && !Client.provider.get(msg.guild, `wordCounters:${msg.channel.id}`))) { checkWordCount(msg, Client.settings); }
    // react with rutgerschan, do reroll
    rutgersChan(msg);
    reroll(msg);
    // detect chains (not in agreement channel)
    if (!msg.guild || (msg.guild && !Client.provider.get(msg.guild, 'agreementChannel')) || (msg.guild && Client.provider.get(msg.guild, 'agreementChannel') !== msg.channel.id)) { detectChain(msg, Client.provider); }
});

// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by this bot
    if (user.id === Client.user.id) { return; }

    // if this is the agreement slim message with the agreement slim reaction start agreement process
    const agreementSlim = Client.provider.get(messageReaction.message.guild, 'agreementSlim');
    if (agreementSlim &&
        agreementSlim.message === messageReaction.message.id &&
        agreementSlim.emote === messageReaction.emoji.id) {
        // get the role
        const toRole = messageReaction.message.guild.roles.cache.get(agreementSlim.role);
        // set the agreement setting
        messageReaction.users.remove(user);
        user.send(`In order to add the ${toRole.name} role you need to be authenticated through 2-step email verification.
Please enter your netID. Your netID is a unique identifier given to you by Rutgers that you use to sign in to all your Rutgers services. It is generally your initials followed by a few numbers.`)
            .then(m => {
                Client.settings.set(`agree:${user.id}`, {
                    guildID: messageReaction.message.guild.id,
                    roleID: agreementSlim.role,
                    step: 2
                });
            })
            .catch(err => {
                if (err) {
                    messageReaction.message.channel.send(`Error: \`${err}\`
This may have happened because you are not accepting DM's.
Turn on DM's from server members:`, { files: ['resources/setup-images/instructions/notif_settings.png', 'resources/setup-images/instructions/dms_on.png'] })
                        .then(m => {
                            setTimeout(() => {
                                m.delete();
                            }, 10000);
                        });
                }
            });
    }
    // if the bot sent one of the messageReactions and it was a wastebin and someone else sent a wastebin, delete it
    const botReaction = messageReaction.message.reactions.cache.find(mr => mr.emoji.name === '🗑' && mr.users.cache.find(u => u.id === Client.user.id));
    if (!!botReaction && botReaction.emoji.name === '🗑' && messageReaction.emoji.name === '🗑') { messageReaction.message.delete(); }
    // use reactionListener
    // for the class command
    reactionListener.emit(`class:${user.id}:${messageReaction.message.id}:${messageReaction.emoji.name}`, Client.registry.commands.get('class'));
    // for approvals
    parseApprovalReaction(Client.provider, Client.users.cache, messageReaction);
});

// emitted on bot joining a guild
Client.on('guildCreate', guild => {
    // run documentation command
    if (guild.owner) {
        Client.registry.commands.get('documentation').run({
            guild: guild,
            author: guild.owner
        });
    }
});

// emitted on member update
Client.on('guildMemberUpdate', (oldM, newM) => {
    if (newM.user.bot) { return; }

    sendRoleResponse(oldM, newM, Client.provider);
});

/*        LOGGING        */
// emitted when a member joins a server
Client.on('guildMemberAdd', member => {
    // log the event
    logEvent({
        embedInfo: {
            author: 'Member joined',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL(),
            thumbnail: member.user.displayAvatarURL()
        },
        guild: member.guild,
        settings: Client.provider
    });
});

// emitted when a member leaves a server
Client.on('guildMemberRemove', member => {
    logEvent({
        embedInfo: {
            author: 'Member left',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL(),
            thumbnail: member.user.displayAvatarURL()
        },
        guild: member.guild,
        settings: Client.provider
    });
});

// emitted when a message gets deleted
Client.on('messageDelete', message => {
    // ignore if not in guild
    if (!message.guild) { return; }
    // ignore deletions by bots
    if (message.author.bot) { return; }
    // ignore deletions in agreement channel
    const agreementChannel = Client.provider.get(message.guild, 'agreementChannel');
    if (agreementChannel && message.channel.id === agreementChannel) { return; }

    const startEmbed = new RichEmbed();
    const extras = [];
    if (message.content) {
        startEmbed.addField('Message content:', message.content.length <= 1024 ? message.content : 'See above for text.');
        if (message.content.length > 1024) { extras.push(`**Deleted:**\n${message.cleanContent}`); }
    }
    startEmbed.addField('In channel:', message.channel);

    logEvent({
        embedInfo: {
            author: 'Message deleted by',
            title: message.author.tag,
            clientUser: Client.user,
            authorThumbnail: message.guild.iconURL(),
            thumbnail: message.author.displayAvatarURL(),
            startingEmbed: startEmbed
        },
        guild: message.guild,
        settings: Client.provider,
        attachments: message.attachments.map(a => a.proxyURL),
        timestamp: message.createdAt
    }, extras);
});

// emitted when a message gets edited
Client.on('messageUpdate', (oMsg, nMsg) => {
    // ignore if not in guild
    if (!oMsg.guild) { return; }
    // ignore updates by bots
    if (oMsg.author.bot) { return; }
    // if the message content is the same, exit
    if (oMsg.content === nMsg.content) { return; }

    // update latex
    if (getLatexMatches(nMsg.cleanContent)) {
        if (getLatexMatches(oMsg.cleanContent)) { reactionListener.emit(`latexEdited:${oMsg.id}`); }
        latexInterpreter(nMsg, nMsg.channel);
    }

    // log edits
    const startEmbed = new RichEmbed();
    const extras = [];
    if (oMsg.content) {
        startEmbed.addField('Old message content:', oMsg.content.length <= 1024 ? oMsg.content : 'See above for text.');
        if (oMsg.content.length > 1024) { extras.push(`**Old:**\n${oMsg.cleanContent}`); }
    }
    if (nMsg.content) {
        startEmbed.addField('New message content:', nMsg.content.length <= 1024 ? nMsg.content : 'See above for text.');
        if (nMsg.content.length > 1024) { extras.push(`**New:**\n${nMsg.cleanContent}`); }
    }
    startEmbed.addField('In channel:', oMsg.channel);

    logEvent({
        embedInfo: {
            author: 'Message edited by',
            title: oMsg.author.tag,
            clientUser: Client.user,
            authorThumbnail: oMsg.guild.iconURL(),
            thumbnail: oMsg.author.displayAvatarURL(),
            startingEmbed: startEmbed
        },
        guild: oMsg.guild,
        settings: Client.provider,
        attachments: oMsg.attachments.array().map(a => a.proxyURL),
        timestamp: oMsg.createdAt
    }, extras);
});

Client.on('unknownCommand', msg => {
});

// unhandled promise rejection stacktrace
process.on('unhandledRejection', (reason, p) => {
    logger.warn(`Unhandled Rejection at: Promise ${inspect(p)}\nreason: ${reason}`);
    console.log('Promise name:', p);
    console.log('Reason:', reason.name);
    // if there's no API key it's probably Travis-CI
    if (reason.name === 'Error [TOKEN_INVALID]') { // this feels wrong :(
        logger.log('error', 'No API token was found. This may have happened because this is a build triggered from Travis-CI or you have not written an "api_keys.json" file.');
        process.exit(0);
    }
});

// unhandled exception
process.on('uncaughtException', (err, origin) => {
    logger.log('error', 'Uncaught exception! (error, origin):', err, origin);
    console.log('Error:', err);
    console.log('Origin:', origin);
});

process.on('SIGINT', () => {
    // notify that the program is about to stop
    logger.log('info', 'SIGINT program interruption detected. Attempting to save certain settings for next reset.');
    // save chains
    saveMsgChainTable(Client.settings)
        .finally(() => process.exit(0));
});

/*        CLEAN UP        */
// set up SettingsProvider
Client.setProvider(
    sqlite.open(
        path.join(__dirname, 'settings.sqlite3')
    )
        .then(db => new Commando.SQLiteProvider(db))
        .catch(console.error)
);
// set up client's command registry
Client.registry
    .registerGroups([
        ['fun', 'Fun'],
        ['customcommands', 'Custom Commands'],
        ['emotes', 'Emotes'],
        ['quotes', 'Quotes'],
        ['soundboard', 'Soundboard'],
        ['information', 'Info'],
        ['config', 'Configure Server Settings'],
        ['moderation', 'Moderation'],
        ['settings', 'Settings'],
        ['verification', 'Verification']
    ])
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands({
        unknownCommand: false
    })
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'));
// log in
Client.login(apiKeys.token);
// exports
exports.Client = Client;
