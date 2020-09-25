/*        	IMPORTS AND GENERAL SETUP	        */
// import sqlite to use as SettingsProvider
const sqlite = require('sqlite');
// import path to join paths in a platform-dependent way
const path = require('path');
// prepare to read in data from JSON files
const fs = require('fs');
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'));
// read in data from JSON file containing default settings for the bot (ClientOptions object)
const ClientOptions = JSON.parse(fs.readFileSync('settings/bot_settings.json', defaults.encoding));
// read in data from JSON file containing API keys
const API_Keys = fs.existsSync('settings/api_keys.json') ? JSON.parse(fs.readFileSync('settings/api_keys.json', defaults.encoding)) : {token:''};
// string formatting
const { oneLine } = require('common-tags');
// get methods for event helpers
const { setCommandFields } = require('./helpers/setCommandFields');
const { latexInterpreter } = require('./helpers/latexInterpreter');
const { parseApprovalReaction } = require('./helpers/implementApprovalPolicy');
const { parseCustomCommand } = require('./helpers/parseCustomCommand');
const { rutgersChan } = require('./helpers/rutgersChan');
const { reroll } = require('./helpers/reroll');
const { checkWordCount } = require('./helpers/checkWordCount');
const { objToEmailBody } = require('./helpers/objToEmailBody');
const { detectChain } = require('./helpers/detectChain');
const { agreeHelper } = require('./helpers/agreeHelper');
const { flushAgreements } = require('./helpers/flushAgreements');
const { checkRoleMentions } = require('./helpers/checkRoleMentions');
const { setLiveRole } = require('./helpers/setLiveRole');
const { flushLiveRoles } = require('./helpers/flushLiveRoles');
const { logEvent } = require('./helpers/logEvent');
const { checkAutoverify } = require('./helpers/checkAutoverify');
const { sendRoleResponse } = require('./helpers/sendRoleResponse');
const { checkProtectedRole } = require('./helpers/checkProtectedRole');
const { generatePresence } = require('./helpers/generatePresence');
const { generateDefaultEmbed } = require('./helpers/generateDefaultEmbed');
const { reactionListener } = require('./helpers/reactionListener');
const { removeInvites } = require('./helpers/removeInvites');
const { payMe } = require('./helpers/payMe');
const { starMe } = require('./helpers/starMe');
const { kateBdayEE } = require('./helpers/kateBdayEE');
// set up winston logging
const logger = require('./logger');
// detailed log of objects
const { inspect } = require('util');
// get some Discord fields we need
const RichEmbed = require('discord.js').RichEmbed;
// initialize the Discord client
const Commando = require('discord.js-commando');
const Client = new Commando.Client(ClientOptions);
// don't stop on expired certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/*        	EVENTS	        */
// emitted on error, warn, debug
Client.on('error', (error) => logger.log('error', `<b>Error</b>: ${error.name}: ${error.message}
Stacktrace: ${error.stack}`))
Client.on('commandError', (command, err, message, args, fromPattern, result) => {
    const emailBody = {
        command: `${command.groupID}:${command.memberName} or ${command.name}`,
        error: `${err.name}: ${err.message}`,
        stackTrace: err.stack,
        arguments: args,
        fromPattern: fromPattern,
    }
    if( message.guild ) emailBody.guild = message.guild.name;
    logger.log('error', objToEmailBody(emailBody));
})
Client.on('warn', (info) => logger.log('warn', info));
Client.on('debug', (info) => logger.log('debug', info) );
Client.on('disconnect', () => logger.warn('Websocket disconnected!'));
Client.on('reconnecting', () => logger.warn('Websocket reconnecting...'));

// emitted on bot being ready to operate
Client.on('ready', () => {
    logger.log( 'info', `Logged onto as ${Client.user.tag}${` at ${new Date(Date.now())}.`}`);
    // periodically refresh command settings
    setCommandFields( Client.registry );
    // peridiocally update the bot's status
    generatePresence( Client, 0 );
});

// when the settings provider is ready
Client.on('providerReady', () => {
    // retrieve messages from the cache
    const messagesToCache = Client.settings.get('messagesToCache') ? Client.settings.get('messagesToCache') : []
    messagesToCache.forEach(msgAndChannel => {
        Client.channels.get(msgAndChannel.channel).fetchMessage(msgAndChannel.message)
            .catch(e => {
                if(e && e.name == "DiscordAPIError") {
                    messagesToCache.splice(messagesToCache.indexOf({channel: msgAndChannel.channel, message: msgAndChannel.message}), 1);
                    Client.settings.set('messagesToCache', messagesToCache);
                }
            })
    });
    // periodically flush messages in #agreement in all servers
    flushAgreements( Client.guilds, Client.provider );
    // periodically flush the live role from users that aren't streaming
    flushLiveRoles( Client.guilds, Client.provider );
})

// emitted on message send
Client.on('message', msg => {
    // ignore messages by all bots
    if( msg.author.bot )
        return;

    // delete messages in #agreement if they're made by non-admins or bots
    if( msg.guild ) {
        const agreementChannel = Client.provider.get( msg.guild, `agreementChannel` )
        if( agreementChannel == msg.channel.id ) {
            // ESCAPE and give the user their role if they entered the autoverify code
            if( checkAutoverify( msg, Client.provider ) ) return
            if( !msg.webhookID && msg.author.id == Client.user.id || (msg.member && !msg.member.hasPermission(defaults.admin_permission)) ) {
                if( msg.content != `${msg.guild.commandPrefix}agree` )
                    msg.channel.send(`Please make sure you send \`${msg.guild.commandPrefix}agree\`. You sent \`${msg.cleanContent}\`.`)
                    .then(m => setTimeout(() => {m.delete()}, 10000));
                msg.delete()
            }
        }
    }

    // agreement process, we need the settings and settingsprovider to access guild and universal settings
    agreeHelper( msg, Client.guilds, Client.settings, Client.provider )
    // if the member is ignored leave
    if( msg.guild && msg.member && Client.provider.get( msg.guild, `ignored:${msg.channel.id}` ) )
        return
    // remove server invite links
    removeInvites( msg, Client )
    // parse a custom command if the message starts with it, send the first word after the prefix to the method
    if( msg.cleanContent.startsWith(msg.guild && msg.guild.commandPrefix) )
        parseCustomCommand( msg
            .cleanContent
            .toLowerCase()
            .split(' ')[0]
            .substring(msg.guild.commandPrefix.length), msg.cleanContent.split(' ').slice(1), Client.provider, msg.channel
        )
    // check if message contains latex formatting
    latexInterpreter( msg.cleanContent, msg.channel )
    // check if role has been mentioned
    checkRoleMentions( msg, Client.provider, Client.user )
    // check if word counters need to be incremented
    if( !msg.guild || (!Client.provider.get(msg.guild, 'wordCounters') && !Client.provider.get(msg.guild, `wordCounters:${msg.channel.id}`)) )
        checkWordCount( msg, Client.settings )
    // pay me or star me
    if( Client.isOwner( msg.author ) ) {
        payMe( msg, Client.registry.commands );
        starMe( msg, Client.registry.commands );
    }
    // react with rutgerschan, do reroll
    rutgersChan( msg );
    reroll( msg );
    // detect chains (not in agreement channel)
    if( !msg.guild || (msg.guild && !Client.provider.get(msg.guild, `agreementChannel`)) || (msg.guild && Client.provider.get(msg.guild, `agreementChannel`) != msg.channel.id) )
        detectChain( msg, Client.provider );
    // kate birthday easter egg
    kateBdayEE( Client, msg );
})

// emitted on adding a reaction to a message
Client.on('messageReactionAdd', (messageReaction, user) => {
    // ignore reactions by this bot
    if( user.id == Client.user.id )
        return

    // if this is the agreement slim message with the agreement slim reaction start agreement process
    const agreementSlim = Client.provider.get(messageReaction.message.guild, 'agreementSlim');
    if( agreementSlim 
        && agreementSlim.message == messageReaction.message.id 
        && agreementSlim.emote == messageReaction.emoji.id ) {
        // get the role
        const toRole = messageReaction.message.guild.roles.get(agreementSlim.role);
        // set the agreement setting
        messageReaction.remove(user);
        user.send(`In order to add the ${toRole.name} role you need to be authenticated through 2-step email verification.
Please enter your netID. Your netID is a unique identifier given to you by Rutgers that you use to sign in to all your Rutgers services. It is generally your initials followed by a few numbers.`)
            .then(m => {
                Client.settings.set(`agree:${user.id}`, {
                    guildID: messageReaction.message.guild.id,
                    roleID: agreementSlim.role,
                    step: 2,
                    nowelcome: true
                })
            })
            .catch(err => {
                if( err )
                    messageReaction.message.channel.send(`Error: \`${err}\`
This may have happened because you are not accepting DM's.
Turn on DM's from server members:`, {files: ['resources/setup-images/instructions/notif_settings.png', 'resources/setup-images/instructions/dms_on.png']})
                    .then(m => {
                        setTimeout(() => {
                            m.delete();
                        }, 10000);
                    })
            })
    }
    // if the bot sent one of the messageReactions and it was a wastebin and someone else sent a wastebin, delete it
    const botReaction = messageReaction.message.reactions.find(mr => mr.me)
    if( botReaction && botReaction.emoji == '🗑' && messageReaction.emoji == '🗑' )
        messageReaction.message.delete()
    // use reactionListener
    // for the class command
    reactionListener.emit(`class:${user.id}:${messageReaction.message.id}:${messageReaction.emoji.name}`, Client.registry.commands.get('class'))
    // for the listquotes command
    if( messageReaction.emoji == '📧' )
        reactionListener.emit(`listquotes:${messageReaction.message.id}`, user)
    // if the reaction was thumbs up approve, otherwise reject
    parseApprovalReaction( Client.provider, Client.users, messageReaction )
})

// emitted on change of guild member properties
Client.on('presenceUpdate', (oldMember, newMember) => {
    if( newMember.user.bot )
        return

    setLiveRole( oldMember, newMember, Client.provider )
})

// emitted on bot joining a guild
Client.on('guildCreate', guild => {
    // run documentation command
    if( guild.owner )
        Client.registry.commands.get('documentation').run({
            guild: guild,
            author: guild.owner
        })
})

// emitted on bot leaving (or getting kicked) from a guild
Client.on('guildDelete', guild => {
    // clear all the settings for that guild
    // the bot can apparently get removed and re-added at any time for any reason. We can't just clear the guild settings when this happens anymore
    // Client.provider.clear( guild )
})

// emitted on member update
Client.on('guildMemberUpdate', (oldM, newM) => {
    if( newM.user.bot )
        return

    sendRoleResponse(oldM, newM, Client.provider)
    checkProtectedRole(oldM, newM, Client.provider, Client.user)
})

/*        	LOGGING	        */
// emitted when a member joins a server
Client.on('guildMemberAdd', member => {
    // log the event
    logEvent({
        embedInfo: {
            author: 'Member joined',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL,
            thumbnail: member.user.displayAvatarURL,
        },
        guild: member.guild,
        settings: Client.provider
    })
})

// emitted when a member leaves a server
Client.on('guildMemberRemove', member => {
    logEvent({
        embedInfo: {
            author: 'Member left',
            title: member.user.tag,
            clientUser: Client.user,
            authorThumbnail: member.guild.iconURL,
            thumbnail: member.user.displayAvatarURL
        },
        guild: member.guild,
        settings: Client.provider,
    })
})

// emitted when a message gets deleted
Client.on('messageDelete', message => {
    // ignore if not in guild
    if( !message.guild )
        return
    // ignore deletions by bots
    if( message.author.bot )
        return
    // ignore deletions in agreement channel
    const agreementChannel = Client.provider.get( message.guild, `agreementChannel` )
    if( agreementChannel && message.channel.id == agreementChannel )
        return

    const startEmbed = new RichEmbed()
    const extras = []
    if( message.content ) {
        startEmbed.addField( 'Message content:', message.content.length <= 1024 ? message.content : 'See above for text.' )
        if( message.content.length > 1024 )
            extras.push( `**Deleted:**\n${message.cleanContent}` )
    }
    startEmbed.addField( 'In channel:', message.channel )

    logEvent({
        embedInfo: {
            author: 'Message deleted by',
            title: message.author.tag,
            clientUser: Client.user,
            authorThumbnail: message.guild.iconURL,
            thumbnail: message.author.displayAvatarURL,
            startingEmbed: startEmbed,
        },
        guild: message.guild,
        settings: Client.provider,
        attachments: message.attachments.array().map(a => a.proxyURL)
    }, extras)
})

// emitted when a message gets edited
Client.on('messageUpdate', (oMsg, nMsg) => {
    // ignore if not in guild
    if( !oMsg.guild )
        return
    // ignore updates by bots
    if( oMsg.author.bot )
        return
    // if the message content is the same, exit
    if( oMsg.content == nMsg.content )
        return

    const startEmbed = new RichEmbed()
    const extras = []
    if( oMsg.content ) {
        startEmbed.addField( 'Old message content:', oMsg.content.length <= 1024 ? oMsg.content : 'See above for text.' )
        if( oMsg.content.length > 1024 )
            extras.push( `**Old:**\n${oMsg.cleanContent}` )
    }
    if( nMsg.content ) {
        startEmbed.addField( 'New message content:', nMsg.content.length <= 1024 ? nMsg.content : 'See above for text.' )
        if( nMsg.content.length > 1024 )
            extras.push( `**New:**\n${nMsg.cleanContent}` )
    }
    startEmbed.addField( 'In channel:', oMsg.channel )

    logEvent({
        embedInfo: {
            author: 'Message edited by',
            title: oMsg.author.tag,
            clientUser: Client.user,
            authorThumbnail: oMsg.guild.iconURL,
            thumbnail: oMsg.author.displayAvatarURL,
            startingEmbed: startEmbed,
        },
        guild: oMsg.guild,
        settings: Client.provider,
        attachments: oMsg.attachments.array().map(a => a.proxyURL)
    }, extras)
})

// unhandled promise rejection stacktrace
process.on('unhandledRejection', (reason, p) => {
    logger.warn(`Unhandled Rejection at: Promise ${inspect(p)}\nreason: ${reason}`);
});

/*        	CLEAN UP	        */
// set up SettingsProvider
Client.setProvider(
    sqlite.open(
        path.join(__dirname, 'settings.sqlite3')
    )
    .then( db => new Commando.SQLiteProvider(db) )
    .catch( console.error )
)
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
    .registerDefaults()
    .registerTypesIn(path.join(__dirname, 'types'))
    .registerCommandsIn(path.join(__dirname, 'commands'))
// log in
Client.login(API_Keys.token)
// exports
exports.Client = Client
