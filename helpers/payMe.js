function payMe( msg, commands ) {
    const bmacCommand = commands.find(c => c.name == 'bmac')
    if( msg.cleanContent.match(/\bpay me\b/i) && bmacCommand )
        bmacCommand.run( msg, null, false, null )
}

exports.payMe = payMe