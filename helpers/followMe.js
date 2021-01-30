function followMe( msg, commands ) {
    const followMeCommand = commands.find(c => c.name === 'followme');
    if ( msg.cleanContent.match(/\bfollow me\b/i) && followMeCommand ) { followMeCommand.run( msg, null, false, null ); }
}

exports.followMe = followMe;
