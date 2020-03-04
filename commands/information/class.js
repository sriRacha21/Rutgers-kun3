const Commando = require('discord.js-commando')
const request = require('request-promise')
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed')
const xRay = require('x-ray')
const x = new xRay()
const convert = require('convert-time')

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
                    prompt: 'Enter the class code formatted as: \`<school code>:<subject code>:<course code>\`. Section code can be optionally inserted at the end is a 2-digit number.',
                    type: 'string',
                    parse: str => str.match(/^(?:[0-9]{2}:)?([0-9]{3}):([0-9]{3}):?([A-Z0-9]{2})?$/i)
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

    static output(classToSend, embed, section, msg) {
        // add prereqs if theyre there
        if( classToSend.preReqNotes && !section )
            embed.addField('Prereqs:', classToSend.preReqNotes
            .replace(/<em>|<\/em>/g, '')
            .replace(/ \)/g,')')
            .replace(/\)\)/g,'))\n'))
        // process professors and the sections they teach
        if( !section ) {
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
            let visited = false
            professorInfos.forEach( professorInfo => {
                if ( embed.fields.length < 25 )
                    embed.addField( professorInfo.name + ':', `Sections: ${professorInfo.sections.length > 0 ? `${professorInfo.sections.join(', ')}` : `None`}` )
                if( embed.fields.length == 25 && !visited ) {
                    visited = true
                    embed.setDescription( (embed.description ? embed.description : '') + '\nResults may be truncated because there was too much output.' )
                }
            })
        } else {
            const foundSection = classToSend.sections.find(s => s.number === section )
            if( !foundSection )
                return msg.channel.send( `Section ${section} could not be found.` )
            embed.setDescription(`**Section ${section}**\nIndex ${foundSection.index}`)
            if( foundSection.instructors && foundSection.instructors.length > 0 )
                embed.addField("Instructors:", foundSection.instructors.map(i => i.name).join('\n') )
            if( foundSection.notes )
                embed.addField("Notes:", foundSection.notes)
            if( foundSection.meetingTimes && foundSection.meetingTimes.length > 0 ) {
                foundSection.meetingTimes.forEach(time => {
                    if ( embed.fields.length < 25 )
                        embed.addField(`${ClassCommand.codeToReadable('meetingDay', time.meetingDay)} ${ClassCommand.codeToReadable('meetingModeDesc', time.meetingModeDesc).toLowerCase()} on ${time.campusName[0]}${time.campusName.slice(1).toLowerCase()}:`,
                        `${time.buildingCode}-${time.roomNumber} from ${convert(`${time.startTime.slice(0,2)}:${time.startTime.slice(2)}`, 'hh:MM A')} to ${convert(`${time.endTime.slice(0,2)}:${time.endTime.slice(2)}`, 'hh:MM A')}` )
                    if( embed.fields.length == 25 )
                        embed.setDescription( (embed.description ? embed.description : '') + '\nResults may be truncated because there was too much output.' )
                })
            }
        }
        // send the message
        return msg.channel.send( embed ).then( m => m.react('🗑') )
    }

    static codeToReadable(type, value) {
        if( type == 'meetingDay' ) {
            if( value == 'M' ) return "Monday"
            else if( value == 'T' ) return "Tuesday"
            else if( value == 'W' ) return "Wednesday"
            else if( value == 'TH' ) return "Thursday"
            else if( value == 'F' ) return "Friday"
            else return "Unknown"
        } else if( type == 'meetingModeDesc' ) {
            if( value == 'LEC' ) return "Lecture"
            else if( value == "RECIT" ) return "Recitation"
            else return "Unknown"
        } //else if( type == 'time' ) {
        //     if( +time.slice(0,2) > 12 )

        // }
        return "Unknown"
    } 
    async run( msg, args ) {
        if( !args.class )
            return msg.channel.send( `That's not a valid class code. Class codes are formatted as \`<school code>:<subject code>:<course code>\`.` )
        const subject = args.class[1]
        const course = args.class[2]
        const section = args.class[3]
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
                // generating the initial embed
                const embed = generateDefaultEmbed({
                    author: `${section ? "Section" : "Class"} information for `,
                    title: classToSend.title,
                    clientUser: this.client.user,
                    msg: msg,
                })
                .setThumbnail()
                if( classToSend.synopsisUrl )
                    embed.setURL(classToSend.synopsisUrl)
                // get the synopsis url if it exists and scrape it for an image
                if( classToSend.synopsisUrl ) {
                    x( classToSend.synopsisUrl, 'img', [{
                        img: '',
                        src: '@src'
                    }])(function(err,header) {
                        if( err ) return
                        if( header.length >= 0 )
                            embed.setImage(header[0].src)
                        if( header.length >= 2 )
                            embed.setThumbnail(header[2].src)
                        ClassCommand.output(classToSend, embed, section, msg)
                    })
                } else
                    ClassCommand.output(classToSend, embed, section, msg)
            }
            else
                return msg.channel.send( `Class could not be found.
Maybe it's not from this semester? Try requesting another semester with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}class ${subject}:${course} '<season> <year>'\`
Example: \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}class 750:273 'fall 2019'\`` )
                .then( m => m.react('🗑') )
        })
    }

}