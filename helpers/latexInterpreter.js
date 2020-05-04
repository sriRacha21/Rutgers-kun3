const { stripIndents } = require('common-tags')
const request = require('request-promise')
const bent = require('bent')
const { inspect } = require('util')
const fs = require('fs')
const path = require('path')
const template = fs.readFileSync(path.join(__dirname, '../resources/latexTemplate.tex')).toString()

async function latexInterpreter( msgContent, channel ) {
    // get matches
    let matches = msgContent.match( /\$\$.+?\$\$/gs )
    // if there are none return
    if( !matches )
        return
    // remove brackets from matches and trim them
    matches = matches
    .map(match => match.substring(2,match.length-2))
    .map(match => match.trim())
    .map(match => match.replace(/`/g, ''))

    // push new image for each request
    const promiseList = []
    channel.startTyping()
    matches.forEach( async match => {
        // replace parts of template
        const latex = template.replace(/#CONTENT/g, match)
        // construct data to prepare to send to api
        const payload = {
            code: latex,
            format: 'png',
            quality: 100,
            density: 440
        }

        // const reqPromise = request({
        //     method: 'POST',
        //     uri: 'https://rtex.probablyaweb.site/api/v2',
        //     body: payload,
        //     json: true
        // }) 
        // promiseList.push( reqPromise )
        const post = bent('POST','json')
        promiseList.push( post('https://rtex.probablyaweb.site/api/v2',payload) )
    })
    Promise.all( promiseList ).then( responses => {
        channel.stopTyping()
        channel.send( `Parsed \`${matches.join('\`, \`')}\`:`, {
            files: responses
            .filter(response => response.status == 'success' )
            .map(response => `https://rtex.probablyaweb.site/api/v2/${response.filename}`)
        }) 
        .then( msg => msg.react('🗑') )
    })
    .catch( err => {
        channel.stopTyping()
        if( err ) channel.send(`The LaTeX interpreter API returned an error: \`${err}\`.`);
    })
}

exports.latexInterpreter = latexInterpreter