const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))
const { generateDefaultEmbed } = require('./generateDefaultEmbed')
const { getDefaultErrChannel } = require('./getDefaultErrChannel')
const oneLine = require('oneline')

function implementApprovalPolicy( approvalPolicyOptions, requiredEmbedInfo ) {
    // declare fields
    let type
    let submissionName
    let permissions
    let member
    let runNoPerms
    let runHasPerms
    let guildSettings
    let attachments
    let errChannel
    // extract fields from object, throw errors or use defaults if fields aren't provided
    type = approvalPolicyOptions.type ? approvalPolicyOptions.type : null
    submissionName = approvalPolicyOptions.submissionName ? approvalPolicyOptions.submissionName : null
    permissions = approvalPolicyOptions.permission ? approvalPolicyOptions.permission : defaults.moderator_permission // by default moderator (kick permission)
    if( approvalPolicyOptions.member ) { member = approvalPolicyOptions.member } else { throw "Member is a required field." }
    if( approvalPolicyOptions.runNoPerms ) { runNoPerms = approvalPolicyOptions.runNoPerms } else { throw "A function to run if a member has no perms is required." }
    if( approvalPolicyOptions.runHasPerms ) { runHasPerms = approvalPolicyOptions.runHasPerms } else { throw "A function to run if a member has perms is required." }
    if( approvalPolicyOptions.guildSettings ) { guildSettings = approvalPolicyOptions.guildSettings } else { throw "The GuildSettingsHelper is required." }
    attachments = approvalPolicyOptions.attachments ? approvalPolicyOptions.attachments : []
    errChannel = getDefaultErrChannel( approvalPolicyOptions.errChannel, guildSettings )
    // check if there's an approval channel
    const approvalChannelID = guildSettings.get('approvalChannel')
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
        }, guildSettings)
        runNoPerms()
    }
    
    return member.hasPermission( permissions )
}

function submitRequestToChannel( requestSubmissionInfo, guildSettings ) {
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

    // send request embed with reactions
    channel.send( reRequest )
    .then( m => {
        m.react('👍')
        m.react('👎')
        guildSettings.set(`request:${m.id}`, {
            approveRequest: () => { runHasPerms() },
            userToNotify: user.id,
            messageToSend: `Your ${type+' '} submission${', `' + submissionName + '`,'} has been `
        })
    })
    // send attachment(s) if the URL resolves
    if( attachments.length > 0 ) {
        channel.send({ files: attachments.map(attachment => attachment.proxyURL) })
        .catch( e => channel.send( `Not able to send associated file: \`${e}\`` ) )
    }
}

exports.implementApprovalPolicy = implementApprovalPolicy