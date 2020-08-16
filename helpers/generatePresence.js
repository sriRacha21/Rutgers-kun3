const exec = require('child_process').execSync
const Game = require('discord.js').Game
const fs = require('fs')
const defaults = JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8'))

function generatePresence( client, which ) {
	const names = [
		`${getNumLines()} lines of code!`,
		`Version ${defaults.version}`,
		`${client.commandPrefix}whoami`,
		`<3 Rutgers-Chan`,
        `New Profile Picture by Jia (@J_Hangz)!`
	]
	const data = {
		name: names[which],
		type: "PLAYING",
	}
	const presence = new Game(data, client.user.presence)
	client.user.setPresence({ game: presence })
    setTimeout( generatePresence, 5*60*1000, client, (which+1) > names.length ? 0 : which + 1 )
}

function getNumLines() {
	let cmdOut = exec(`git ls-files | grep -E '.js$' | xargs wc -l`, { encoding: 'utf-8' }).split(" ")
	let numLines = cmdOut[cmdOut.length-2]
	return +numLines
}

exports.generatePresence = generatePresence
