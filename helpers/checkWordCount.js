const { oneLine } = require('common-tags')

function checkWordCount( msg, settings ) {
    const wordCounts = settings.get(`countword:${msg.author.id}`)
    // stop if there were no words found
    if( !wordCounts )
        return

    wordCounts.forEach(( wordCountInfo ) => {
        // declare vars
        let word
        let count 
        // init vars
        if( wordCountInfo.word ) { word = wordCountInfo.word } else { throw 'word is a required field.' }
        if( wordCountInfo.count >= 0 ) { count = wordCountInfo.count } else { throw 'count is a required field.' }

        const regex = new RegExp(`(^| )?${word}($|[' ,.?!])?`,'gi')
        const msgContent = msg.cleanContent.toLowerCase()
        const wordFrequency = msgContent.match(regex) ? msgContent.match(regex).length : 0
        if( wordFrequency > 0 ) {
            wordCountInfo.count += wordFrequency
            msg.channel.send(oneLine`${msg.member ? msg.member.displayName : msg.author.username}'s
\`${word}\` counter: ${count + wordFrequency}`)
        }
    })
    
}

exports.checkWordCount = checkWordCount