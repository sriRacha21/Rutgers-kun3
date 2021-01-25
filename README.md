# Rutgers-kun3 [![Build Status](https://travis-ci.com/sriRacha21/Rutgers-kun3.svg?branch=master)](https://travis-ci.com/sriRacha21/Rutgers-kun3)
A complete rewrite of the Rutgers-kun Discord bot built for Rutgers University Discord servers. Old version is hosted [here](https://github.com/sriRacha21/Rutgers-kun).

### How to Use
1. [Click me to add me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=291355097919913985&permissions=0&scope=bot)
2. [Setup](documentation/setup.md).

### What is (and isn't) Rutgers-kun?
* Rutgers-kun **is** a bot that lets you manage your userbase by helping you designate who is and isn't a Rutgers student reliably.
    * This is done with netID verification. [Here's a little demo.](https://streamable.com/pz31rc)
* Rutgers-kun **is** a bot that creates a feeling of connectedness between Rutgers servers with a lot of data being saved between servers (such as quotes and phrase tracking).
    * This bot is in many of the biggest Discord servers in the Rutgers community and can make your community look more attractive to students who have joined servers that already have Rutgers-kun.
* Rutgers-kun **is** a bot you can drop in a personal server if you like the less serious features (such as the fun commands, quoting, and phrase tracking).
* Rutgers-kun **does** optionally support recording netID's. THe hosted version that is linked above has this feature enabled, and is used solely for safety and convenience reasons.
    * Why is my netID recorded? Can I opt-out?
        * If you are a new Rutgers student or you just joined Discord it can be overwhelming joining a variety of servers. The bot remembering your netID saves our email client a lot of emails and saves you a lot of time from having to check your email repeatedly.
        * Feel free to fork this project and run this bot on your own machine for your Discord server. At this time there is no way to opt out of netID recording on the already hosted version.
* Rutgers-kun **isn't** a general purpose Discord bot.
    * If you need role reactions, deep custom command templating, muting, filtering, and more you should use a bot like [YAGPDB](https://yagpdb.xyz/) or [Dyno](https://dyno.gg/).
* Rutgers-kun **isn't** perfect.
    * Rutgers-kun has been being worked on for 2+ years by a one-man team. It's improved a lot over the years but it's not going to have 100% uptime and it's not always going to work as expected.
    * If you find bugs or have feature requests PLEASE open an [issue](https://github.com/sriRacha21/Rutgers-kun3/issues) and/or [join the development Discord](https://discord.gg/YDEpNDV) and feel free to ping me (@sriRacha#1999)!

### How to run me locally!
1. Clone me somewhere you feel comfortable keeping Github projects: `git clone https://github.com/sriRacha21/Rutgers-kun3.git`
2. Navigate to the `settings` folder within the project.
3. Edit `api_keys.json.dist` and replace the "your token here text" with your API token (surrounded by double quotation marks), obtained from the Discord developer portal. Rename the file to `api_keys.json`.
4. Edit `email_logging.json.dist` and rename it `email_logging.json`. If you are forking the project, you can edit this file to email you on errors. **(OPTIONAL)**
5. Edit `smtp_server.json.dist` with your SMTP server's details. Rename the file to `smtp_server.json`. **(OPTIONAL)**
6. Rename `netids.json.dist` to `netids.json` to start recording netID's (to check if a user is already verified). **(OPTIONAL)**
7. Rename `default_settings.json.dist` to `default_settings.json`. Adjust properties in file as needed (you probably want to change the agrement setup slim emote to the ID of an emote the bot can access.)
8. `cd` to root directory of the project.
9. `npm install`
10. `node main.js`