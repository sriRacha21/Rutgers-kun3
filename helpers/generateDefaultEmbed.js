const RichEmbed = require('discord.js').RichEmbed;
const oneLine = require('oneline');
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('default_settings.json', 'utf-8'))

function generateDefaultEmbed( author, title, clientUser, msg ) {
    const embed = new RichEmbed()
        .setAuthor( author, clientUser.displayAvatarURL )
        .setTitle( title )
        .setThumbnail( clientUser.displayAvatarURL )
        .setFooter( oneLine`${msg ? `Requested ${msg.createdAt.toLocaleString()} by ${msg.author.tag}` : clientUser.tag }`
                    , clientUser.displayAvatarURL )
        .setColor( defaults.richembed_color )

    return embed;
}

exports.generateDefaultEmbed = generateDefaultEmbed;