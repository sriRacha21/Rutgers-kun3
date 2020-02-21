const RichEmbed = require('discord.js').RichEmbed
const { oneLine } = require('common-tags')
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function generateDefaultEmbed( requiredEmbedInfo ) {
    const author = requiredEmbedInfo.author
    const title = requiredEmbedInfo.title
    const clientUser = requiredEmbedInfo.clientUser
    const msg = requiredEmbedInfo.msg
    const guild = requiredEmbedInfo.guild ? requiredEmbedInfo.guild : (msg ? msg.guild : null)
    const authorThumbnail = requiredEmbedInfo.authorThumbnail ? requiredEmbedInfo.authorThumbnail : (guild ? guild.iconURL : clientUser.displayAvatarURL)
    const thumbnail = requiredEmbedInfo.thumbnail ? requiredEmbedInfo.thumbnail : clientUser.displayAvatarURL
    const startingEmbed = requiredEmbedInfo.startingEmbed ? requiredEmbedInfo.startingEmbed : new RichEmbed()

    startingEmbed
        .setTitle( title )
        .setThumbnail( thumbnail )
        .setFooter( oneLine`${msg ? `Requested ${msg.createdAt.toLocaleString()}
by ${msg.author.tag}${guild ? ` in ${guild.name}` : ``}` : clientUser.tag }`
                    , msg ? msg.author.displayAvatarURL : clientUser.displayAvatarURL )
        .setColor( defaults.richembed_color )

    if( requiredEmbedInfo.author )
        startingEmbed.setAuthor( author, authorThumbnail )

    return startingEmbed
}

exports.generateDefaultEmbed = generateDefaultEmbed