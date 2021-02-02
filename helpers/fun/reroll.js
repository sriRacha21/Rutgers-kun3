function reroll( msg ) {
    if ( msg.cleanContent.match(/arjun w[oi]ns? [^ ]* giveaway/i) ) {
        const random = Math.random();
        if ( random < 0.9 ) { msg.channel.send( 'I hit that fat reroll' ); } else { msg.channel.send({ files: [ 'resources/reroll.png' ] }); }
    }
}

exports.reroll = reroll;
