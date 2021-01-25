const exec = require('child_process').execSync;
const Activity = require('discord.js').Activity;
const fs = require('fs');
const package = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
const logger = require('../logger')

function generatePresence( client, which ) {
    logger.log('info', 'Running microtask generatePresence.');

	const names = [
		`${getNumLines()} lines of code!`,
		`Version ${package.version}`,
		`${client.commandPrefix}whoami`,
		`DM me "addme" to add me to your server!`,
		`<3 Rutgers-Chan`,
        `New Profile Picture by Jia (@J_Hangz)!`
	];
	const presence = {
		name: names[which],
		type: "PLAYING",
	};
	// const presence = new Game(data, client.user.presence);
	client.user.setPresence({ activity: presence });
    setTimeout( generatePresence, 15*60*1000, client, (which+1) > names.length ? 0 : which + 1 );
}

function getNumLines() {
	let cmdOut = exec(`git ls-files | grep -E '.js$' | xargs wc -l`, { encoding: 'utf-8' }).split(" ");
	let numLines = cmdOut[cmdOut.length-2];
	return +numLines;
}

exports.generatePresence = generatePresence
