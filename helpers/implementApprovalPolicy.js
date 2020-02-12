const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))
const { generateDefaultEmbed } = require('./generateDefaultEmbed')
const oneLine = require('oneline')

function implementApprovalPolicy( approvalPolicyOptions, requiredEmbedInfo ) {
    // declare fields
    let type
    let submissionName
    let permissions
    let member
    let runNoPerms
    let runHasPerms
    let settings
    let attachments
    let errChannel
    // extract fields from object, throw errors or use defaults if fields aren't provided
    type = approvalPolicyOptions.type ? approvalPolicyOptions.type : null
    submissionName = approvalPolicyOptions.submissionName ? approvalPolicyOptions.submissionName : null
    permissions = approvalPolicyOptions.permission ? approvalPolicyOptions.permission : defaults.moderator_permission // by default moderator (kick permission)
    if( approvalPolicyOptions.member ) { member = approvalPolicyOptions.member } else { throw "member is a required field." }
    if( approvalPolicyOptions.runNoPerms ) { runNoPerms = approvalPolicyOptions.runNoPerms } 
    else { runNoPerms = () => { 
        errChannel.send(  `Your ${type} suggestion has been sent to mods and is pending approval. You will be notified by DM if it is approved.` ) 
    } }
    if( approvalPolicyOptions.runHasPerms ) { runHasPerms = approvalPolicyOptions.runHasPerms } else { throw "A function to run if a member has perms is required." }
    if( approvalPolicyOptions.settings ) { settings = approvalPolicyOptions.settings } else { throw "GuildSettingsHelper is required." }
    attachments = approvalPolicyOptions.attachments ? approvalPolicyOptions.attachments : []
    if( approvalPolicyOptions.errChannel ) { errChannel = approvalPolicyOptions.errChannel } else { throw 'errChannel is a required field.' }
    // check if there's an approval channel
    const approvalChannelID = settings.get( member.guild, 'approvalChannel')
    // adjust RequiredEmbedInfo to defaults
    requiredEmbedInfo.author = requiredEmbedInfo.author ? requiredEmbedInfo.author : `${type.charAt(0).toUpperCase() + type.slice(1)} add attempt by`
    // run appropriate function, run it normally if the user has proper perms or there's no approval channel, with approval otherwise
    if( member.hasPermission( permissions ) || !approvalChannelID ) {
        runHasPerms()
    } else {
        submitRequestToChannel({
            type: type,
            submissionName: submissionName,
            user: member.user,
            guild: member.guild,
            approvalChannelID: approvalChannelID,
            requiredEmbedInfo: requiredEmbedInfo,
            runHasPerms: runHasPerms,
            attachments: attachments,
            errChannel: errChannel
        }, settings)
        runNoPerms()
    }
    
    return member.hasPermission( permissions )
}

function submitRequestToChannel( requestSubmissionInfo, settings ) {
    const type = requestSubmissionInfo.type
    const submissionName = requestSubmissionInfo.submissionName
    const user = requestSubmissionInfo.user
    const guild = requestSubmissionInfo.guild
    const approvalChannelID = requestSubmissionInfo.approvalChannelID
    const requiredEmbedInfo = requestSubmissionInfo.requiredEmbedInfo
    const runHasPerms = requestSubmissionInfo.runHasPerms
    const attachments = requestSubmissionInfo.attachments
    const errChannel = requestSubmissionInfo.errChannel
    // find channel by ID
    const channel = guild.channels
    .find( channel => channel.id == approvalChannelID )
    // check if channel exists
    if( !channel ) 
        errChannel.send( oneLine`Approval channel was not found. Please set approval channel
        with \`${errChannel.guild.commandPrefix ? errChannel.guild.commandPrefix : '<prefix>'}
        set approvalChannel <approval channel id>\`` )

    // generate request embed
    const reRequest = generateDefaultEmbed( requiredEmbedInfo )
    .setThumbnail( user.displayAvatarURL )

    // send request embed with reactions
    channel.send( reRequest )
    .then( m => {
        m.react('👍')
        .then( setTimeout( () => {m.react('👎')}, 1000 ))
        settings.set( channel.guild, `request:${m.id}`, {
            approveRequest: () => { runHasPerms() },
            userToNotify: user.id,
            messageToSend: `Your ${type} submission${', `' + submissionName + '`,'} has been `
        })
    })
    // send attachment(s) if the URL resolves
    if( attachments.length > 0 ) {
        channel.send({ files: attachments.map(attachment => attachment.proxyURL) })
        .catch( e => channel.send( `Not able to send associated file: \`${e}\`` ) )
    }
}

function parseApprovalReaction( settings, usersCache, messageReaction ) {
    const approvalInfo = settings.get( messageReaction.message.guild, `request:${messageReaction.message.id}`)
    if( approvalInfo ) {
        // find user by ID
        const userToDM = usersCache.find( u => u.id == approvalInfo.userToNotify )
        settings.remove( messageReaction.message.guild, `request:${messageReaction.message.id}`)
        // unable to find user, don't dm but continue adding the sound
        if( !userToDM )
            console.warn( `Cache miss on user ID: ${approvalInfo.userToNotify}! Ignoring...` )
        if( messageReaction.emoji.name == '👍' ) {
            approvalInfo.approveRequest()
            if( userToDM )
                userToDM.send( approvalInfo.messageToSend + 'approved.' )
        }
        if( messageReaction.emoji.name == '👎' ) {
            if( userToDM )
                userToDM.send( approvalInfo.messageToSend + 'rejected.' )
        }
    }
}

exports.implementApprovalPolicy = implementApprovalPolicy
exports.parseApprovalReaction = parseApprovalReaction