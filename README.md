# Rutgers-kun3 [![Build Status](https://travis-ci.com/sriRacha21/Rutgers-kun3.svg?branch=master)](https://travis-ci.com/sriRacha21/Rutgers-kun3)
A complete rewrite of the Rutgers-kun Discord bot built for the Rutgers Esports Discord. Old version is hosted [here](https://github.com/sriRacha21/Rutgers-kun).

### How to Use
1. [Click me to add me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=291355097919913985&permissions=0&scope=bot)
2. [Setup](documentation/setup.md).

### How to run me locally!
1. Clone me somewhere you feel comfortable keeping Github projects: `git clone https://github.com/sriRacha21/Rutgers-kun3.git`
2. Edit `api_keys.json.dist` and replace the "your token here text" with your API token (surrounded by double quotation marks), obtained from the Discord developer portal. Rename the file to `api_keys.json`.
3. Edit `email_logging.json.dist` and rename it `email_logging.json`. If you are forking the project, you can edit this file to email you on errors. **(OPTIONAL)**
4. Edit `smtp_server.json.dist` with your SMTP server's details. Rename the file to `smtp_server.json`. **(OPTIONAL)**
5. Rename `netids.json.dist` to `netids.json` to start recording netID's (to check if a user is already verified). **(OPTIONAL)**
6. `cd` to root directory of the project.
7. `npm install`
8. `node main.js`
