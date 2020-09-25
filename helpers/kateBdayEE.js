const execSync = require('child_process').execSync;
const { getRandomElement } = require('./getRandom')

const kateUserID = '87525135241728000';
const introduction = `Hewo Kate 🥺
I see this is your first time using me so I'll explain briefly how I work:
* Your identity is saved by user ID, so even if you change your username I will always recognize you.
* If you want to talk to me, just say "hey". To stop talking to me and have me treat you like other users just say "bye".
* If you want to see a list of what I can do just type "help" while Kate mode is on.`;
const heartEmotes = [
    "♥",
    "💘",
    "💖",
    "💗",
    "💓",
    "💝",
    "💞",
    "💟",
    "💕",
    "😍",
];
const kateMessages = [
    "Kate you're my habibi!",
    "Kate is my lil bun!",
    "I love you, Kate.",
    "You're my honey bun!",
    "E",
    "So basically im monky.",
    "Uh oh...",
    "*pomf*",
    "Kate is my lil mooncake!",
];
const commands = [
    [ 'arjun', 'Randomly get a picture of arjub' ],
    [ 'meme', 'Randomly output a cute meme :)' ],
    [ 'bye', 'Leave Kate mode. Type \`hey\` to re-enter Kate mode after leaving.' ]
];
const helpMessage = `**__Available Commands in Kate Mode__**

${commands.map(c => `**${c[0]}:** ${c[1]}`).join('\n')}`;

function kateBdayEE( client, msg ) {
    // if the user is in a guild don't run
    if( msg.guild )
        return;
    // if the user is not kate don't run
    if( msg.author.id != kateUserID )
        return;
    // decide enabling/disabling kate mode, if this is a message enabling/disabling kate mode stop
    if( kateModeHandler( client.settings, msg, client.dispatcher, msg.author, client.emojis ) )
        return;
    // check kate mode's current state
    const kateModeState = client.settings.get('kateMode');
    // handle kate mode commands
    if( msg.content && kateModeState )
        commandHandler( msg.author, msg.content.toLowerCase() );
}

function kateModeHandler( settings, msg, dispatcher, author, emojis ) {
    // check kate mode's current state
    const kateModeState = settings.get('kateMode');

    messageText = msg.content.toLowerCase();
    if( messageText == 'hey' ) {
        // if kate mode is already on send a message and do nothing
        if( kateModeState ) author.send("Kate mode is already on but I'll turn it on again for you! *boop*");
        else {
            if( kateModeState === undefined ) author.send(introduction);
            const peepoHappy = emojis.find(e => e.name=='peepoHappy');
            settings.set('kateMode', true).then(() => author.send('Kate mode is on! ' + (peepoHappy ? peepoHappy : '')));
            const inhibitor = m => {
                if( m.author.id == kateUserID ) return true;
            };
            settings.set('kateMode:inhibitor', inhibitor);
            dispatcher.addInhibitor(inhibitor);
        }
        return true;
    } else if( messageText == 'bye' ) {
        const peepoupset = emojis.find(e => e.name=='peepoUpset');
        if( !kateModeState ) author.send("Kate mode is already off but I'll turn it off again. " + (peepoupset ? peepoupset : ''))
        else {
            const nookwave = emojis.find(e => e.name=='NookWave');
            settings.set('kateMode', false).then(() => author.send('Leaving Kate mode... Hope to see you again soon! ' + (nookwave ? nookwave : '')));
            const inhibitor = settings.get('kateMode:inhibitor');
            if( inhibitor ) dispatcher.removeInhibitor(inhibitor);
        }
        return true;
    }
    return false;
}

function commandHandler( author, command ) {
    if( command == 'help' ) {
        author.send(helpMessage);
    } else if( command == 'arjun' ) {
        sendRandomImage('/root/Rutgers-kun/resources/arjunphotos/', author)
    } else if( command == 'meme' ) {
        sendRandomImage('/root/Rutgers-kun/resources/kateMemes/', author)
    } else if( command == 'i love you' || command == 'ily' ) {
        const heartEmote = getRandomElement(heartEmotes);
        author.send('I love you too! ' + (heartEmote ? heartEmote: ''))
    } else {
        author.send(getRandomElement(kateMessages));
    }
}

function sendRandomImage(path, author) {
    try {
        const filePath = pickFileRandomlyFromDirectory(path);
        author.send({files: [ filePath ]});
    } catch(error) {
        author.send("Folder could not be found. It's possible ownership of the project has moved to someone else and the feature is no longer supported. :(");
        return;
    }
}

function pickFileRandomlyFromDirectory( path ) {
    // get random meme from folder and send that
    let files = execSync(`ls ${path}`);
    files = files.toString().split('\n').filter(f => f.length > 0);
    let file = getRandomElement(files);
    return path + file;
}

exports.kateBdayEE = kateBdayEE;