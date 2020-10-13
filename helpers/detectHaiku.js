const nlp = require('compromise');
nlp.extend(require('compromise-syllables'))

// 200 character limit! We don't want to waste time processing messages that are too long!!!
function detectHaiku(msg) {
    if( msg.cleanContent.length > 200 ) return;

    let json = nlp(msg.cleanContent).terms().syllables();
    const builtHaiku = haikuBuilder(json);

    if( builtHaiku != '' )
        return msg.channel.send(`Wow you made a haiku!

${builtHaiku}`);
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
