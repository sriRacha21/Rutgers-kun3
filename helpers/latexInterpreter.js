const request = require('request-promise')
const { stripIndents } = require('common-tags')

async function latexInterpreter( msgContent, channel ) {
    // get matches
    let matches = msgContent.match( /\[\[.+?\]\]/g )

    // was there a match?
    const matchFound = matches && matches.length > 0
    // decide if we want to suggest using latex functionality
    const suggestMatch = msgContent.match(/\^|sqrt|sin\(|cos\(|tan\(/g)

    // ignore no matches
    if( !matchFound ) {
        // if no match was found and one is suggested send suggestion message
        if( channel && suggestMatch )
            channel.send( stripIndents`I see you're trying to enter math. I can parse LaTeX! Try entering an expression in double square brackets and I'll parse it.
            Example: This line can be expressed as [[y=x-2]].` )
        return
    }

    // remove brackets from matches
    matches = matches.map(match => match.substring(2,match.length-2))

    // map matches to urls
    let urls = matches.map(match => `https://www.wiris.net/demo/editor/render?format=png&latex=${encodeURI(match)}&backgroundColor=%23fff&redherring=default.png`)

    // return array of URL's to images or a message if a channel is supplied
    return channel 
    ? channel.send( `Parsed ${matches.map(match => `\`${match}\``).join(', ')}`, { files: urls })
    .catch( e => channel.send(`One or more latex expressions could not be interpreted: \`${e}\``) )
    : urls
}

exports.latexInterpreter = latexInterpreter