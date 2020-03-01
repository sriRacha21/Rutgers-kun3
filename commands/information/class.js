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
        if( !args.class )
            return msg.channel.send( `That's not a valid class code. Class codes are formatted as \`<school code>:<subject code>:<course code>\`.` )
        const subject = args.class[1]
        const course = args.class[2]
        const campus = args.campus
        const level = args.level

        // we need to construct the current semester given the date
        const date = new Date().getDate()
        const month = new Date().getMonth()
        const year = new Date().getFullYear()
        let season = null
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
        
        // assign variables to prepare to make request
        const semester = `${season}${year}`

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
                .addField('Prereqs:', classToSend.preReqNotes
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
                return msg.channel.send( embed )
            }
            else
                return msg.channel.send( 'Class could not be found.' )
        })
    }
}