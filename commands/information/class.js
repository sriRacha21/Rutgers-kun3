const Commando = require('discord.js-commando');
const bent = require('bent');
const getJSON = bent('json');
const getBuffer = bent('buffer');
const { generateDefaultEmbed } = require('../../helpers/generateDefaultEmbed');
const { reactionListener } = require('../../helpers/reactionListener');
const xRay = require('x-ray');
// eslint-disable-next-line new-cap
const x = new xRay();
const { reactRecursive } = require('../../helpers/detectChain');
const courseNonArgRegex = /(?:[0-9]{2}:)?([0-9]{3}):([0-9]{3}):?([A-Z0-9]{2})?/i;
const courseRegex = /^(?:[0-9]{2}:)?([0-9]{3}):([0-9]{3}):?([A-Z0-9]{2})?$/i;
const emojiCharacters = require('../../helpers/emojiCharacters');
const logger = require('../../logger');
const { inspect } = require('util');

module.exports = class ClassCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'class',
            aliases: [ 'getclass' ],
            group: 'information',
            memberName: 'class',
            description: 'Get a class\' information.',
            args: [
                {
                    key: 'class',
                    label: 'class code',
                    prompt: 'Enter the class code formatted as: `<school code>:<subject code>:<course code>`. Section code can be optionally inserted at the end is a 2-digit number.',
                    type: 'string',
                    parse: str => str.match(courseRegex)
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
                    default: 'NB'
                },
                {
                    key: 'level',
                    prompt: 'Enter the two letter course level.',
                    type: 'string',
                    default: 'UG'
                }
            ]
        });
    }

    static processPreReqNotes( preReqNotes, reactions, emojiClassDict ) {
        const courseGlobalRegex = new RegExp(courseNonArgRegex, 'gi');
        const courseCodes = preReqNotes.match(courseGlobalRegex);
        let letter = 'a';
        // if there are more course codes in the prereq notes than letter just leave lol
        if ( !courseCodes || (courseCodes && courseCodes.length > 26) ) { return preReqNotes; }
        const uniqueCourseCodes = [];
        courseCodes.forEach( courseCode => {
            if ( uniqueCourseCodes.includes(courseCode) ) { return; }
            uniqueCourseCodes.push(courseCode);
            preReqNotes = preReqNotes.replace(courseCode, `$& ${emojiCharacters[letter]} `);
            // emit to the event emitter saying that a reaction has been added to the message
            reactions.push(emojiCharacters[letter]);
            emojiClassDict[emojiCharacters[letter]] = courseCode.match(/^(?:[0-9]{2}:)?([0-9]{3}):([0-9]{3}):?([A-Z0-9]{2})?$/);
            letter = String.fromCharCode(letter.charCodeAt(0) + 1);
        });
        return preReqNotes;
    }

    static codeToReadable(type, value) {
        if ( type === 'meetingDay' ) {
            if ( value === 'M' ) return 'Monday';
            else if ( value === 'T' ) return 'Tuesday';
            else if ( value === 'W' ) return 'Wednesday';
            else if ( value === 'TH' ) return 'Thursday';
            else if ( value === 'F' ) return 'Friday';
            else return 'Unknown';
        } else if ( type === 'meetingModeDesc' ) {
            if ( value === 'LEC' ) return 'Lecture';
            else if ( value === 'RECIT' ) return 'Recitation';
            else if ( value === 'WORKSHOP' ) return 'Workshop';
            else if ( value === 'REMOTE-SYNCH' ) return 'Remote Synchronous';
            else if ( value === 'REMOTE-ASYNCH' ) return 'Remote Asynchronous';
            else return 'Unknown';
        }
        return 'Unknown';
    }

    async run( msg, args ) {
        if ( !args.class ) { return msg.channel.send( 'That\'s not a valid class code. Class codes are formatted as `<school code>:<subject code>:<course code>`.' ); }
        const subject = args.class[1];
        const course = args.class[2];
        const section = args.class[3];
        const campus = args.campus;
        let level = args.level;
        const seasonYear = args.seasonYear;

        // we need to construct the current semester given the date
        const date = new Date().getDate();
        const month = new Date().getMonth();
        let year = new Date().getFullYear();
        let season;
        if ( seasonYear === 'default' ) {
            if ( month >= 7 && (month < 11 || ( month === 11 && date < 23 )) ) {
                // fall
                season = '9';
            } else if ( (month === 0 && date >= 12) || (month > 0 && month < 4) || (month === 4 && date < 23) ) {
                // spring
                season = '1';
            } else if ( (month === 4 && date >= 23) || (month > 4 && month < 7) || (month === 7 && date < 12) ) {
                // summer
                season = '7';
            } else if ( (month === 11 && date >= 23) || (month === 0 && date < 12) ) {
                // winter
                season = '0';
            } else {
                throw new Error(`Season could not be chosen for date: ${month}/${date}.`);
            }
        } else {
            if ( seasonYear[1] === 'spring' ) season = '1';
            else if ( seasonYear[1] === 'fall' ) season = '9';
            else if ( seasonYear[1] === 'summer' ) season = '7';
            else if ( seasonYear[1] === 'winter' ) season = '0';
            else throw new Error('Invalid season passed.');
            year = seasonYear[2];
        }

        // if the class is greater than 500, it's probably a grad course
        if (+course >= 500) level = 'G';

        // assign variables to prepare to make request
        const semester = `${season}${year}`;

        // make request
        msg.channel.startTyping();
        const url = `http://sis.rutgers.edu/oldsoc/courses.json?subject=${subject}&semester=${semester}&campus=${campus}&level=${level}`;
        logger.info(`Requesting URL: ${url}`);
        getJSON(url)
            .then( json => {
                const classToSend = json.find(d => +d.courseNumber === +course);
                msg.channel.stopTyping();
                if ( classToSend ) {
                    // generating the initial embed
                    const embed = generateDefaultEmbed({
                        author: `${section ? 'Section' : 'Class'} information for `,
                        title: classToSend.title,
                        clientUser: this.client.user,
                        msg: msg
                    })
                        .setThumbnail();
                    if ( classToSend.synopsisUrl ) { embed.setURL(classToSend.synopsisUrl); }
                    // get the synopsis url if it exists and scrape it for an image
                    if ( classToSend.synopsisUrl ) {
                        x( classToSend.synopsisUrl, 'img', [{
                            img: '',
                            src: '@src'
                        }])(async(err, header) => {
                            if (err) return;
                            if (header.length >= 0 && header[0] && header[0].src) {
                                try {
                                    await getBuffer(header[0].src);
                                    embed.setImage(header[0].src);
                                } catch {
                                    logger.log('warn', `Unable to reach resource: ${header[0].src}.`);
                                }
                            }
                            if (header.length >= 2 && header[2] && header[2].src) {
                                try {
                                    await getBuffer(header[2].src);
                                    embed.setThumbnail(header[2].src);
                                } catch {
                                    logger.log('warn', `Unable to reach resource: ${header[2].src}.`);
                                }
                            }
                            ClassCommand.output(classToSend, embed, section, msg, args);
                        });
                    } else { ClassCommand.output(classToSend, embed, section, msg, args); }
                } else {
                    return msg.channel.send( `Class could not be found.
Maybe it's not from this semester? Try requesting another semester with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}class ${subject}:${course} '<season> <year>'\`
Example: \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}class 750:273 'fall 2019'\`` )
                        .then( m => m.react('🗑') );
                }
            });
    }

    static amOrPm( pmCode ) {
        if ( pmCode.toLowerCase() === 'p' ) {
            return 'PM';
        } else if ( pmCode.toLowerCase() === 'a' ) {
            return 'AM';
        }
        return '?M';
    }

    static output(classToSend, embed, section, msg, args) {
        // store reactions and dictionary that we're gonna use for reaction browsing
        const reactions = [];
        const emojiClassDict = {};
        // add prereqs if theyre there
        if ( classToSend.preReqNotes && !section ) {
            // process prereq notes before sending them
            let preReqNotes = classToSend.preReqNotes
                .replace(/<em>|<\/em>/g, '')
                .replace(/ \)/g, ')')
                .replace(/\)\)/g, '))\n');

            preReqNotes = ClassCommand.processPreReqNotes(preReqNotes, reactions, emojiClassDict);
            embed.addField('Prereqs:', preReqNotes);
        }
        // add core codes if theyre there
        if ( classToSend.coreCodes && classToSend.coreCodes.length > 0 ) {
            let coreCodes = '';
            classToSend.coreCodes.forEach(coreCode => {
                coreCodes += `${coreCode.code} (${coreCode.description})\n`;
            });
            embed.addField('Requirements Satisfied:', coreCodes);
        }
        // process professors and the sections they teach
        if ( !section ) {
            const professorInfos = [];
            classToSend.sections.forEach( section => {
                if ( section.instructors ) {
                    section.instructors.map(i => i.name).forEach(name => {
                        if ( !professorInfos.map(i => i.name).includes(name) ) {
                            professorInfos.push({
                                name: name,
                                sections: []
                            });
                        }
                    });
                }
            });
            professorInfos.forEach( professorInfo => {
                classToSend.sections.forEach( section => {
                    if ( section.instructors && section.instructors.map(i => i.name).includes(professorInfo.name) ) { professorInfo.sections.push(section.number); }
                });
            });
            let visited = false;
            professorInfos.forEach(professorInfo => {
                if (embed.fields.length < 25) { embed.addField( professorInfo.name + ':', `Sections: ${professorInfo.sections.length > 0 ? `${professorInfo.sections.join(', ')}` : 'None'}` ); }
                if (embed.fields.length === 25 && !visited) {
                    visited = true;
                    embed.setDescription( (embed.description ? embed.description : '') + '\nResults may be truncated because there was too much output.' );
                }
            });
        } else {
            const foundSection = classToSend.sections.find(s => s.number === section );
            if ( !foundSection ) { return msg.channel.send( `Section ${section} could not be found.` ); }
            embed.setDescription(`**Section ${section}**\nIndex ${foundSection.index}`);
            if ( foundSection.instructors && foundSection.instructors.length > 0 ) { embed.addField('Instructors:', foundSection.instructors.map(i => i.name).join('\n') ); }
            if ( foundSection.notes ) { embed.addField('Notes:', foundSection.notes); }
            if ( foundSection.meetingTimes && foundSection.meetingTimes.length > 0 ) {
                foundSection.meetingTimes.forEach(time => {
                    if ( embed.fields.length < 25 ) {
                        const place = `${time.buildingCode}-${time.roomNumber}`;
                        const startTime = time.startTime ? `${time.startTime.slice(0, 2)}:${time.startTime.slice(2)} ${time.pmCode}M` : null;
                        const endTime = time.endTime ? `${time.endTime.slice(0, 2)}:${time.startTime.slice(2)} ${time.pmCode}M` : null;

                        embed.addField(`${time.meetingDay ? ClassCommand.codeToReadable('meetingDay', time.meetingDay) : ''} ${ClassCommand.codeToReadable('meetingModeDesc', time.meetingModeDesc)} ${time.campusName ? 'on ' + time.campusName : 'online'}:`,
                            `${time.buildingCode ? `${place} from` : ''} ${startTime && endTime ? `${startTime} to ${endTime}` : 'No start or end time provided.'}` );
                    }
                    if ( embed.fields.length === 25 ) { embed.setDescription( (embed.description ? embed.description : '') + '\nResults may be truncated because there was too much output.' ); }
                });
            }
        }
        // send the message
        return msg.channel.send( embed ).then(m => {
            reactions.unshift('🗑');
            reactRecursive( m, reactions, (mr) => {
                if ( mr.emoji.name === '🗑' ) { return; }
                reactionListener.once(`class:${msg.author.id}:${m.id}:${mr.emoji.name}`, (command) => {
                    command.run(msg, {
                        class: emojiClassDict[mr.emoji.name],
                        seasonYear: args.seasonYear,
                        campus: args.campus,
                        level: args.level
                    }, true);
                });
            });
        })
            .catch(err => {
                msg.channel.send('There was a problem finding this class. This error will be automatically logged.');
                logger.log('error', `Error with class command output: ${err}
${inspect(embed)}`);
            });
    }
};
