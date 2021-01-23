// const HashTable = require('hashtable')
// const msgChainTable = new HashTable()
const msgChainTable = {};
const { getRandomElement } = require('./getRandom');

const numberEmotes = [
    '0️⃣', '1️⃣', '2️⃣', '3️⃣',
    '4️⃣', '5️⃣', '6️⃣', '7️⃣',
    '8️⃣', '9️⃣', '🔢',
];

const angery = [
    '😠', '😡', '💢'
];

function detectChain( msg, settings ) {
    // ignore messages not in a server
    if( !msg.guild )
        return;
    // ignore if the chain setting exists and is off
    // comparison to bool is done because the value must be explicitly set (default to true)
    if( settings.get( msg.guild, 'chain' ) === false )
        return;
    // ignore if the highscore command is off
    const chainCommand = msg.client.registry.commands.get('chain');
    if( chainCommand && !chainCommand.isEnabledIn(msg.guild) )
        return;

    // in order to start the chain properly a buffer of messages must be maintained
    // add to buffer if the message matches the other ones, ensure buffer is mainainted by key value channel id
    // pass a function that happens when the chain is broken
    const bufferMatchSize = checkBufferMatch(msg, (bufferMatchSize, message) => {
        // react to chain breaking message with an angry face
        msg.react(getRandomElement(angery));
        // if the chain was the highest ever recorded in the server set the new record and output a message
        // but only if the score is 2 or higher.
        const maybeHighscore = settings.get( msg.guild, 'chain:highscore' )
        // if there is no current high score or the current score is higher than the current high score, set the new record and output a message
        if( !maybeHighscore || bufferMatchSize > maybeHighscore.score ) {
            settings.set( msg.guild, 'chain:highscore', {
                message: message.content,
                channel: msg.channel.id,
                score: bufferMatchSize,
                breaker: msg.author.id,
            })
            msg.channel.send( `New chain highscore for server \`${msg.guild.name}\` of ${bufferMatchSize}!` );
        }
    })

    if( bufferMatchSize ) {
        // react with numbers appropriately
        // cover special case of needing to label first message with 1
        if( bufferMatchSize == 2 )
            msgChainTable[msg.channel.id][0].react(numberEmotes[1]);
        reactRecursive(msg, numToEmoteArr(bufferMatchSize));
    }

    return;
}

function checkBufferMatch( msg, breakingFunction ) {
    let isBufferMatch = false
    const maybeMsgArr = msgChainTable[msg.channel.id];
    if( maybeMsgArr ) {
        isBufferMatch = maybeMsgArr.reduce( (accumulator, message) => {
            return accumulator
            &&  (
                    message.author.id != msg.author.id
                    && message.content == msg.content
                    && message.content != ''
                )
        }, true)
        maybeMsgArr.push( msg );
        // reset the entry in the hashtable if the chain is broken
        if( !isBufferMatch ) {
            msgChainTable[msg.channel.id] = [ msg ];
            if( maybeMsgArr.length > 2 )
                breakingFunction(maybeMsgArr.length - 1, maybeMsgArr[0] );
        }
    } else
        msgChainTable[msg.channel.id] = [ msg ];

    const msgArr = msgChainTable[msg.channel.id];

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

function reactRecursive( msg, array, cb ) {
    if( array[0] ) {
        const reactPromise = msg.react(array[0])
        if( cb )
            reactPromise.then( mr => cb(mr) )
        setTimeout(() => {
            reactRecursive( msg, array.slice(1), cb )
        }, 500)
    }
}

exports.detectChain = detectChain
exports.reactRecursive = reactRecursive
