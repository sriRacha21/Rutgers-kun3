const { getRandomElement } = require('./getRandom')

function rutgersChan( msg ) {
    const heartEmotes = [
        "♥",
        "💘",
        "💖",
        "💗",
        "💓",
        "💝",
        "💞",
        "💟",
        "💕",
        "😍",
    ]

    if ( msg.cleanContent.match(/rutgers.?chan/i) ) {
		let random = Math.random()
		if( random < 0.9 )
			msg.react( getRandomElement( heartEmotes ) )
		else
			msg.channel.send( "Oh? The busses don't come on time? Too f\\*\\*\\*ing bad!" )
	}
}

exports.rutgersChan = rutgersChan