const RichEmbed = require('discord.js').RichEmbed;
const oneLine = require('oneline');
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function generateDefaultEmbed( requiredEmbedInfo ) {
    const author = requiredEmbedInfo.author
    const title = requiredEmbedInfo.title
    const clientUser = requiredEmbedInfo.clientUser
    const msg = requiredEmbedInfo.msg
    const thumbnail = requiredEmbedInfo.thumbnail ? requiredEmbedInfo.thumbnail : clientUser.displayAvatarURL
    const startingEmbed = requiredEmbedInfo.startingEmbed ? requiredEmbedInfo.startingEmbed : new RichEmbed()

    startingEmbed
        .setAuthor( author, clientUser.displayAvatarURL )
        .setTitle( title )
        .setThumbnail( thumbnail )
        .setFooter( oneLine`${msg ? `Requested ${msg.createdAt.toLocaleString()} by ${msg.author.tag}` : clientUser.tag }`
                    , clientUser.displayAvatarURL )
        .setColor( defaults.richembed_color )

    return startingEmbed
}

exports.generateDefaultEmbed = generateDefaultEmbed;