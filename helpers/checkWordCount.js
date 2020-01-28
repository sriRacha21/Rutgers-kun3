const { oneLine } = require('common-tags')

function checkWordCount( msg, settings ) {
    const wordCountInfo = settings.get(`countword:${msg.author.id}`)
    // stop if there was no setting found
    if( !wordCountInfo )
        return
    // declare vars
    let word
    let count 
    // init vars
    if( wordCountInfo.word ) { word = wordCountInfo.word } else { throw 'word is a required field.' }
    if( wordCountInfo.count >= 0 ) { count = wordCountInfo.count } else { throw 'count is a required field.' }

    const regex = new RegExp(`(^| )${word}($| )`,'g')
    const wordFrequency = msg.cleanContent.match(regex) ? msg.cleanContent.match(regex).length : 0
    if( wordFrequency > 0 ) {
        settings.set( `countword:${msg.author.id}`, {
            word: word,
            count: count + wordFrequency
        })
        .then( msg.channel.send(oneLine`${msg.member ? msg.member.displayName : msg.author.username}'s
\`${word}\` counter: ${count + wordFrequency}`) )
    }
}

exports.checkWordCount = checkWordCount