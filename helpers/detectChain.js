const HashTable = require('hashtable')
const logger = require('../logger')
const msgChainTable = new HashTable()

const numberEmotes = [
    '0️⃣', '1️⃣', '2️⃣', '3️⃣', 
    '4️⃣', '5️⃣', '6️⃣', '7️⃣', 
    '8️⃣', '9️⃣', '🔢',
]

function detectChain( msg, settings ) {
    // ignore messages not in a server
    if( !msg.guild )
        return
    // ignore if the chain setting exists and is off
    // comparison to bool is done because the value must be explicitly set (default to true)
    if( settings.get( msg.guild, 'chain' ) === false )
        return

    // in order to start the chain properly a buffer of messages must be maintained
    // add to buffer if the message matches the other ones, ensure buffer is mainainted by key value channel id
    const bufferMatchSize = checkBufferMatch( msg )

    if( bufferMatchSize ) {
        // cover special case of needing to label first message with 1
        if( bufferMatchSize == 2 )
            msgChainTable.get(msg.channel.id)[0].react(numberEmotes[1])
        reactRecursive(msg, numToEmoteArr(bufferMatchSize))
    }

    return
}

function checkBufferMatch( msg ) {
    let isBufferMatch = false
    const maybeMsgArr = msgChainTable.get(msg.channel.id)
    if( maybeMsgArr ) {
        isBufferMatch = maybeMsgArr.reduce( (accumulator, message) => {
            return accumulator 
            &&  (
                    message.author.id != msg.author.id 
                    && message.content == msg.content 
                    && message.content != ''
                )
        }, true)
        maybeMsgArr.push( msg )
        // reset the entry in the hashtable if the chain is broken
        if( !isBufferMatch )
            msgChainTable.put( msg.channel.id, [ msg ] )
    } else
        msgChainTable.put( msg.channel.id, [ msg ] )

    const msgArr = msgChainTable.get(msg.channel.id)

    // return the chain size
    return isBufferMatch ? msgArr.length : 0
}

function numToEmoteArr( num ) {
    const emoteNum = []
    const numArr = num.toString().split('')

    // find duplicates within the number
    for( let i = 0; i < numArr.length; i++ )
        for( let j = 0; j < numArr.length; j++ )
            if( i != j && numArr[i] == numArr[j] ) {
                emoteNum.push( numberEmotes[10] )
                return emoteNum
            }
    numArr.forEach( digit => {
        emoteNum.push( numberEmotes[digit] )
    })

    return emoteNum
}

function reactRecursive( msg, array ) {
    if( array[0] ) {
        msg.react(array[0])
        setTimeout(() => {
            reactRecursive( msg, array.slice(1) )
        }, 1000)
    }
}

exports.detectChain = detectChain