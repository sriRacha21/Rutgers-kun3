const { stripIndents } = require('common-tags')
const request = require('request-promise')
const { inspect } = require('util')
const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(path.join(__dirname, '../resources/latexTemplate.tex')).toString()

async function latexInterpreter( msgContent, channel ) {
    // get matches
    let matches = msgContent.match( /\$\$.+?\$\$/gs )
    // was there a match?
    const matchFound = matches && matches.length > 0
    // decide if we want to suggest using latex functionality
    const suggestMatch = msgContent.match(/sqrt|sin\(|cos\(|tan\(/g)

    // ignore no matches
    if( !matchFound ) {
        // if no match was found and one is suggested send suggestion message
        if( channel && suggestMatch )
            channel.send( stripIndents`I see you're trying to enter math. I can parse LaTeX! Try entering an expression in double dollar signs and I'll parse it.
            Example: This line can be expressed as $$y=x-2$$.` )
        return
    }

    // remove brackets from matches and trim them
    matches = matches
    .map(match => match.substring(2,match.length-2))
    .map(match => match.trim())

    // push new image for each request
    matches.forEach( async match => {
        channel.startTyping()
        // replace parts of template
        const latex = template.replace(/#CONTENT/g, match)
        // construct data to prepare to send to api
        const payload = {
            code: latex,
            format: 'png',
            quality: 100,
            density: 440
        }

        request({
            method: 'POST',
            uri: 'http://rtex.probablyaweb.site/api/v2',
            body: payload,
            json: true
        })
        .then( response => {
            channel.stopTyping()
            if( response.status == 'success' )
                channel.send( `Parsed \`${match}\`:`, { files: [ `http://rtex.probablyaweb.site/api/v2/${response.filename}` ] })
            else
                channel.send( `That appears to be invalid LaTeX! Error: ${response.description}` )
        } )
    })
}

exports.latexInterpreter = latexInterpreter