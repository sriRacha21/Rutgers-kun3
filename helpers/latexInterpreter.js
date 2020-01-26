const { stripIndents } = require('common-tags')

function latexInterpreter( msgContent, channel ) {
    // get matches
    let matches = msgContent.match( /\[\[.+?\]\]/g )

    // ignore no matches
    if( !matches || matches.length == 0 )
        return

    // remove brackets from matches
    matches = matches.map(match => match.substring(2,match.length-2))

    // map matches to urls
    const urls = matches.map(match => `https://www.wiris.net/demo/editor/render?format=png&latex=${encodeURI(match)}&backgroundColor=%23fff&redherring=default.png`)

    // return array of URL's to images or a message if a channel is supplied
    return channel ? channel.send( `Parsed ${matches.map(match => `\`${match}\``).join(', ')}`, { files: urls }) : urls
}

function suggestLatex( msg ) {
    const match = msg.cleanContent.match(/\^|sqrt|sin\(|cos\(|tan\(/g)

    if( match ) 
        msg.channel.send( stripIndents`I see you're trying to enter math. I can parse LaTeX! Try entering an expression in double square brackets and I'll parse it.
        Example: This line can be expressed as [[y=x-2]].` )
}

exports.latexInterpreter = latexInterpreter
exports.suggestLatex = suggestLatex