function starMe( msg, commands ) {
    const starmeCommand = commands.find(c => c.name === 'starme');
    if ( msg.cleanContent.match(/\bstar me\b/i) && starmeCommand ) { starmeCommand.run( msg, null, false, null ); }
}

exports.starMe = starMe;
