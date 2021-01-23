const nlp = require('compromise');
nlp.extend(require('compromise-syllables'))
const { reactionListener } = require('./reactionListener')
const { generateDefaultEmbed } = require('./generateDefaultEmbed')

// 200 character limit! We don't want to waste time processing messages that are too long!!!
function detectHaiku(msg, client) {
    if( msg.cleanContent.length > 200 ) return;

    let json = nlp(msg.cleanContent).terms().syllables();
    const builtHaiku = haikuBuilder(json);

    reactionListener.addListener(`haiku:DEBUG:${msg.id}`, (user) => {
        if( msg.cleanContent.length > 200 || json.length > 25 ) {
            user.send('Messages longer than 200 characters or with more than 25 terms are automatically ignored by the natural language processor.');
            return;
        }

        const embed = generateDefaultEmbed({
            author: 'Haiku Debugger',
            title: 'Haiku Debugging Information for the following message',
            clientUser: client.user,
            msg: msg,
        });

        embed.setDescription(`${msg.cleanContent}
**${json.map(t => t.syllables).reduce((acc, val) => acc.concat(val), []).length} syllables.**`);
        json.forEach((term,idx) => {
            embed.addField(`Term ${idx+1}:`, `Text: \`${term.text}\`
Normal (cleaned): \`${term.normal}\`
Syllables: \`${term.syllables.map(s => `"${s}"`).join(', ')}\``);
        });

        user.send(embed);
    });

    if( builtHaiku != '' ) {
        let haikuText = `Wow you made a haiku!

${builtHaiku}`;

        msg.react('🪶');
        reactionListener.once(`haiku:${msg.id}`, (user) => {
            msg.channel.send( haikuText );
        });
    }

}

function haikuBuilder(syllableData) {
    // build 5 syllable part
    [lineOne, idx] = buildLine(5, syllableData, 0);
    // build 7 syllable part
    [lineTwo, idx] = buildLine(7, syllableData, idx+1);
    // build 5 syllable part
    [lineThree, idx] = buildLine(5, syllableData, idx+1);

    if( lineOne == '' || lineTwo == '' || lineThree == '' || idx+1 != syllableData.length ) return '';
    return [lineOne,lineTwo,lineThree]
        .map(line => `*${line.trim()}*`)
        .join('\n');
}

function buildLine(totalSyllables, syllableData, startIdx) {
    // left to right in array
    let haikuLine = '';
    let syllableCount = 0;

    for(let i = startIdx; i < syllableData.length; i++) {
        let term = syllableData[i];

        haikuLine += term.text + ' ';
        syllableCount += term.syllables.length;
        if(syllableCount == totalSyllables)
            return [haikuLine,i];
    }

    return ['', syllableData.length];
}

exports.detectHaiku = detectHaiku;
