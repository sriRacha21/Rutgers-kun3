const bent = require('bent')
const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(path.join(__dirname, '../resources/latexTemplate.tex')).toString()
const { reactionListener } = require('./reactionListener')

function getLatexMatches( msgContent ) {
    // match $$ thing $$
    const matches = msgContent.match( /\$\$.+?\$\$/gs );
    return matches ? matches : [];
}

function isSpoiler( match ) {
    return match.match(/\|\|.+?\|\|/);
}

async function latexInterpreter( sentMessage, channel ) {
    let msgContent = sentMessage.cleanContent;

    // get matches
    let matches = getLatexMatches(msgContent);

    // if there are none return
    if( matches.length == 0 )
        return;

    // remove dollar signs from matches and trim them
    matches = matches
    .map(match => match
        .substring(2, match.length-2)
        .trim()
        .replace(/`/g, ''));
    
    // figure out which are spoilers and mark em
    const spoilers = [];
    matches.forEach((match, idx) => {
        spoilers[idx] = isSpoiler(match);
    });

    // normalize spoilers
    matches.map(match => isSpoiler(match) ? match.substring(2, match.length-2) : match);

    // push new image for each request
    const promiseList = [];
    channel.startTyping();
    matches.forEach( async match => {
        // replace parts of template
        const latex = template.replace(/#CONTENT/g, match);
        // construct data to prepare to send to api
        const payload = {
            code: latex,
            format: 'png',
            quality: 100,
            density: 440
        };

        const post = bent('POST','json');
        promiseList.push( post('https://rtex.probablyaweb.site/api/v2', payload) );
    });

    Promise.all( promiseList ).then( responses => {
        // filter and map responses
        const mappedResponses = responses
            .filter(response => response.status == 'success')
            .filter((_,idx) => !spoilers[idx])
            .map((response, idx) => {
                return {
                    attachment: `https://rtex.probablyaweb.site/api/v2/${response.filename}`,
                    name: `latex_${idx}.png`
                };
            });

        const mappedSpoilerResponses = responses
            .filter(response => response.status == 'success')
            .filter((_,idx) => spoilers[idx])
            .map((response, idx) => {
                return {
                    attachment: `https://rtex.probablyaweb.site/api/v2/${response.filename}`,
                    name: `SPOILER_latex_${idx}.png`
                };
            });

        let sentMessagePromises = [];
        if(mappedResponses.length == 0 && mappedSpoilerResponses.length == 0) {
            sentMessagePromises.push( channel.send('There were issue(s) parsing your LaTeX expression(s). Please edit your message with a valid LaTeX expression.') );
        } else {
            if(mappedResponses.length > 0)
                sentMessagePromises.push( channel.send({
                    files: mappedResponses
                }));
            if(mappedSpoilerResponses.length > 0)
                sentMessagePromises.push( channel.send({
                    files: mappedSpoilerResponses
                }));
        }

        sentMessagePromises.forEach(sentMessagePromise => {
            sentMessagePromise.then( msg => {
                msg.react('🗑') 
                // add a listener that disappears after a minute for latex corrections
                const eventName = `latexEdited:${sentMessage.id}`
                const listener = () => {
                    msg.delete();
                }
                reactionListener.once(eventName, listener);
                setTimeout(() => {
                    reactionListener.removeListener(eventName, listener);
                }, 60000);
            });
        });
    })
    .catch( err => {
        if( err ) channel.send(`The LaTeX interpreter API returned an error: \`${err}\`.`);
    })
    .finally(() => {
        channel.stopTyping();
    })
}

exports.latexInterpreter = latexInterpreter;
exports.getLatexMatches = getLatexMatches;