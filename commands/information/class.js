const Commando = require('discord.js-commando')
const request = require('request-promise')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')

module.exports = class ClassCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'class',
            aliases: [ 'getclass' ],
            group: 'information',
            memberName: 'class',
            description: `Get a class' information.`,
            args: [
                {
                    key: 'class',
                    label: 'class code',
                    prompt: 'Enter the class code formatted as: \`<school code>:<subject code>:<course code>\`.',
                    type: 'string',
                    parse: str => str.match(/^[0-9]{2}:([0-9]{3}):([0-9]{3}$)/) || str.match(/^([0-9]{3}):([0-9]{3}$)/),
                },
                {
                    key: 'seasonYear',
                    prompt: 'Enter the season and year you want to query the API for.',
                    type: 'string',
                    validate: str => str.match(/(spring|fall|winter|summer) ([0-9]{4})/i),
                    parse: str => str.match(/(spring|fall|winter|summer) ([0-9]{4})/i),
                    default: 'default',
                    error: 'Please format your season and year as `<spring/fall/winter/summer> <year>`'
                },
                {
                    key: 'campus',
                    prompt: 'Enter the two letter campus-code.',
                    type: 'string',
                    default: 'NB',
                },
                {
                    key: 'level',
                    prompt: 'Enter the two letter course level.',
                    type: 'string',
                    default: 'UG',
                }
            ]
        })
    }


    async run( msg, args ) {
        console.log( args.seasonYear )
        if( !args.class )
            return msg.channel.send( `That's not a valid class code. Class codes are formatted as \`<school code>:<subject code>:<course code>\`.` )
        const subject = args.class[1]
        const course = args.class[2]
        const campus = args.campus
        const level = args.level
        const seasonYear = args.seasonYear

        // we need to construct the current semester given the date
        const date = new Date().getDate()
        const month = new Date().getMonth()
        let year = new Date().getFullYear()
        let season
        let semester
        if( seasonYear === 'default' ) {
            if( month >= 8 && (month < 11 || ( month == 11 && date < 23 )) ) // fall
                season = '9'
            else if( (month == 0 && date >= 21) || (month > 0 && month < 4) || (month == 4 && date < 4) ) // spring
                season = '1'
            else if( (month == 4) && (date >= 26) || (month > 4 && month < 7) || (month == 7 && date < 12) ) // summer
                season = '7'
            else if( (month == 11 && date >= 23) || (month == 0 && date < 17) ) // winter
                season = '0'
            else
                throw 'Oh no.'
        } else {
            if( seasonYear[1] === 'spring' ) season = '1'
            else if( seasonYear[1] === 'fall' ) season = '9'
            else if( seasonYear[1] === 'summer' ) season = '7'
            else if( seasonYear[1] === 'winter' ) season = '0'
            else throw 'Oh no.'
            year = seasonYear[2]
        }
        
        // assign variables to prepare to make request
        semester = `${season}${year}`

        // make request
        msg.channel.startTyping()
        request(`http://sis.rutgers.edu/oldsoc/courses.json?subject=${subject}&semester=${semester}&campus=${campus}&level=${level}`)
        .then( data => {
            const json = JSON.parse(data)
            const classToSend = json.find(d => +d.courseNumber == course)
            msg.channel.stopTyping()
            if( classToSend ) {
                const embed = generateDefaultEmbed({
                    author: 'Class information for ',
                    title: classToSend.title,
                    clientUser: this.client.user,
                    msg: msg,
                })
                .setURL(json.synopsisURL)
                if( classToSend.preReqNotes )
                    embed.addField('Prereqs:', classToSend.preReqNotes
                    .replace(/<em>|<\/em>/g, '')
                    .replace(/ \)/g,')')
                    .replace(/\)\)/g,'))\n'))
                const professorInfos = []
                classToSend.sections.forEach( section => {
                    if( section.instructors ) 
                        section.instructors.map(i => i.name).forEach(name => {
                            if( !professorInfos.map(i => i.name).includes(name) )
                                professorInfos.push({
                                    name: name,
                                    sections: []
                                })
                        })
                })
                professorInfos.forEach( professorInfo => {
                    classToSend.sections.forEach( section => {
                        if( section.instructors && section.instructors.map(i => i.name).includes(professorInfo.name) )
                            professorInfo.sections.push(section.number)
                    })
                })
                professorInfos.forEach( professorInfo => {
                    embed.addField( professorInfo.name + ':', `Sections: ${professorInfo.sections.length > 0 ? `${professorInfo.sections.join(', ')}` : `None`}` )
                })
                return msg.channel.send( embed ).then( m => m.react('🗑') )
            }
            else
                return msg.channel.send( `Class could not be found.
Maybe it's not from this semester? Try requesting another semester with \`${msg.guild.commandPrefix ? msg.guild.commandPrefix : this.client.commandPrefix}class ${subject}:${course} '<season> <year>'\`
Example: \`${msg.guild.commandPrefix ? msg.guild.commandPrefix : this.client.commandPrefix}class 750:273 'fall 2019'\`` )
                .then( m => m.react('🗑') )
        })
    }
}