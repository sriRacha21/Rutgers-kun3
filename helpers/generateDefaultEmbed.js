const RichEmbed = require('discord.js').MessageEmbed
const { oneLine } = require('common-tags')
const fs = require('fs')
const defaults = fs.existsSync('settings/default_settings.json') ? JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8')) : {err: true};

function generateDefaultEmbed( requiredEmbedInfo ) {
    if(defaults.err) {
        logger.log('error', 'No default_settings.json file was found. Unintended behavior may occur. Make sure you rename settings/default_settings.json.dist to settings/default_settings.json.');
        return;
    }

    const author = requiredEmbedInfo.author;
    const title = requiredEmbedInfo.title;
    const clientUser = requiredEmbedInfo.clientUser;
    const msg = requiredEmbedInfo.msg;
    const guild = requiredEmbedInfo.guild ? requiredEmbedInfo.guild : (msg ? msg.guild : null);
    const authorThumbnail = requiredEmbedInfo.authorThumbnail ? requiredEmbedInfo.authorThumbnail : (guild ? guild.iconURL() : clientUser.displayAvatarURL());
    const thumbnail = requiredEmbedInfo.thumbnail ? requiredEmbedInfo.thumbnail : clientUser.displayAvatarURL();
    const startingEmbed = requiredEmbedInfo.startingEmbed ? requiredEmbedInfo.startingEmbed : new RichEmbed();

    startingEmbed
        .setTitle( title )
        .setThumbnail( thumbnail )
        .setFooter( oneLine`${msg ? `Requested by ${msg.author.tag}${guild ? ` in ${guild.name}` : ``}` : clientUser.tag }`
                    , msg ? msg.author.displayAvatarURL() : clientUser.displayAvatarURL() )
        .setColor( defaults.richembed_color )
        .setTimestamp();

    if( requiredEmbedInfo.author )
        startingEmbed.setAuthor( author, authorThumbnail );

    return startingEmbed;
}

exports.generateDefaultEmbed = generateDefaultEmbed;