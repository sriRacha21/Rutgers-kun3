const Commando = require('discord.js-commando')
const fs = require('fs')
const path = require('path')
const fiddlerFile = fs.existsSync(path.join(__dirname,'../../settings/fiddler.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname,'../../settings/fiddler.json')).toString()) : null
const exec = require('child_process').execSync

module.exports = class CCommand extends Commando.Command {
    constructor(client) {
        super(client, {
            name: 'c',
            aliases: ['evalc'],
            group: 'fiddle',
            memberName: 'c',
            description: 'Interpret C.',
            args: [
                {
                    key: 'code',
                    prompt: 'Enter the C code you would like to interpret.',
                    type: 'code'
                }
            ]
        })
    }


    async run( msg, args ) {
        // check if fiddler file exists
        if( !fiddlerFile )
            return msg.channel.send('Fiddler file could not be found in environment! Exiting...')
        if( !fiddlerFile.c )
            return msg.channel.send('Fiddler file has no \`c\` property.')

        // get code and put it in a variable
        let code
        for( let i = 1; i < 4; i++ )
            if( args.code[i] ) code = args.code[i]

        // tell user we're going to start interpreting soon
        msg.channel.startTyping()
        msg.channel.send(`Preparing to interpret C code:\n\`\`\`c\n${code}\n\`\`\``)
        
        // get the file and put it in a variable, make replacement, then write it to another file
        const templateLocation = path.join(fiddlerFile.c.templateFolder, fiddlerFile.c.templateName)
        const template = fs.existsSync(templateLocation) ? fs.readFileSync(templateLocation).toString() : null
        if( !template )
            msg.channel.send(`Location \`${templateLocation}\` could not be found in the fiddler file.`)
        const file = template.replace(fiddlerFile.c.replacementText ? fiddlerFile.c.replacementText : "#CONTENT", code)
        const filename = `${msg.author.id}.c`
        fs.writeFileSync(path.join(fiddlerFile.c.templateFolder, filename), file)
        const fileLocation = path.join(fiddlerFile.c.templateFolder, filename)

        // compile the new file outputting compilation details
        const outFilePath = path.join(fiddlerFile.c.templateFolder, `${msg.author.id}.out`)
        let compilationOutput
        try {
            compilationOutput = exec(`gcc ${fileLocation} -o ${outFilePath}`).toString()
        } catch( e ) {
            msg.channel.stopTyping()
            return msg.channel.send(`Error while compiling: \`${e}\``)
        }
        msg.channel.send(compilationOutput ? `Compilation output:\n\`\`\`bash\n${compilationOutput}\n\`\`\`` : `\`${filename}\` compiled successfully.`)

        // if the file we attempted to compile to doesn't exist, exit
        if( !fs.existsSync(outFilePath) )
            return

        // attempt to run the file as the fiddler user
        let runOutput
        try {
            runOutput = exec(`timeout 5s sudo -u ${fiddlerFile.c.user} "${outFilePath}"`)
        } catch( e ) {
            msg.channel.stopTyping()
            return msg.channel.send(`Error while running: \`${e}\``)
        }

        // clean-up
        exec(`rm ${path.join(fiddlerFile.c.templateFolder, filename.split('.')[0]+'*')}`)

        // output message
        msg.channel.stopTyping()
        return msg.channel.send(runOutput ? `Run output:\n\`\`\`c\n${runOutput}\n\`\`\`` : 'No output.', {split: true})
	}
}