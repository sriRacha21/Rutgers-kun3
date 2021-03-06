# Rutgers-kun3 [![Build Status](https://travis-ci.com/sriRacha21/Rutgers-kun3.svg?branch=master)](https://travis-ci.com/sriRacha21/Rutgers-kun3) [![Discord](https://discordapp.com/api/guilds/770415315674857482/embed.png)](https://discord.gg/ydepndv)

> Rutgers-kun is a Discord bot built on [Discord.js](https://github.com/discordjs/discord.js) and [Commando](https://github.com/discordjs/Commando) dedicated to provide utility and a sense of connectedness between Discord servers under Rutgers University. He was originally built under [Rutgers Esports](http://www.rutgersesports.com/) but since his inception, his functionality has become generalized for use by any server.

<img align="right" src="resources/branding/chibi_rutgers-kun.png" alt="Profile Art by @J_Hangz" width="200"/>

## Table of contents

- [How to Use](#how-to-use)
- [What is (and isn't) Rutgers-kun?](#what-is-and-isnt-rutgers-kun)
- [Features](#features)
- [Contributing](#contributing)
    - [Run me locally!](#run-me-locally)
    - [Linting](#linting)
    - [Submit a Pull Request](#submit-a-pull-request)
- [Contact](#contact)

## How to Use
1. [Click me to add me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=291355097919913985&permissions=0&scope=bot)
2. [Setup](documentation/setup.md) (if you want netID verification).

## What is (and isn't) Rutgers-kun?
* Rutgers-kun **is** a bot that lets you manage your userbase by helping you designate who is and isn't a Rutgers student reliably.
    * This is done with netID verification. [Here's a little demo.](https://streamable.com/pz31rc)
* Rutgers-kun **is** a bot that creates a feeling of connectedness between Rutgers servers with a lot of data being saved between servers (such as quotes and phrase tracking).
    * This bot is in many of the biggest Discord servers in the Rutgers community and can make your community look more attractive to students who have joined servers that already have Rutgers-kun.
* Rutgers-kun **is** a bot you can drop in a personal server if you like the less serious features (such as the fun commands, quoting, and phrase tracking).
* Rutgers-kun **does** optionally support recording netID's. The hosted version that is linked above has this feature enabled, and is used solely for safety and convenience.
    * Why is my netID recorded? Can I opt-out?
        * If you are a new Rutgers student or you just joined Discord it can be overwhelming joining a variety of servers. The bot remembering your netID saves our email client a lot of emails and saves you a lot of time from having to check your email repeatedly.
        * Feel free to fork this project and run this bot on your own machine for your Discord server. At this time there is no way to opt out of netID recording on the already hosted version.
* Rutgers-kun **isn't** a general purpose Discord bot.
    * If you need role reactions, deep custom command templating, muting, filtering, and more you should use a bot like [YAGPDB](https://yagpdb.xyz/) or [Dyno](https://dyno.gg/).
* Rutgers-kun **isn't** perfect.
    * Rutgers-kun has been being worked on for 2+ years by a one-man team. It's improved a lot over the years but it's not going to have 100% uptime and it's not always going to work as expected.
    * If you find bugs or have feature requests PLEASE open an [issue](https://github.com/sriRacha21/Rutgers-kun3/issues) and/or [join the development Discord](https://discord.gg/YDEpNDV) and feel free to ping me (@sriRacha#1999)!

## Features
* 2-step **netID verification** attached to a role (or multiple). [Here's a demo.](https://streamable.com/pz31rc) You can also use this as entry gate.
* LaTeX interpreter (trigger `$$like this$$`).
* Quoting (quotes are saved cross-server).
* Custom commands with shallow command templating.
* Soundboard.
* Emote, custom command, soundboard addition screening.
* Bring up Rutgers class information (`!class 198:112`).

## Contributing

### Run me locally!
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

### Linting
* Rutger-kun uses ESLint to maintain and enforce code quality.
* Before you commit code, run ESlint by using `npm run lint`. ESLint will check the project for any issues/errors.
* Husky and lint-staged will prevent you from pushing code with issues. Travis will additonally check for any lint issues on your build. 

### Submit a Pull Request
1. Fork this repository (should be on the top right of this page).
2. Clone the fork of the repository locally.
3. Switch to a new feature branch `git checkout -b <awesome-new-feature-name>`
4. Code your cool new feature!
5. [Run](#run-me-locally) and test your cool new feature.
6. Stage, commit, and push your files:
```
git add <changed-files...>
git commit -m "Cool new commit for my cool new feature"
git push origin <awesome-new-feature-name>
```
7. `git` will output a link to help you create a new pull request from there.

## Contact
- Arjun Srivastav
    - [@srirachaIsSpicy](https://twitter.com/sriRachaIsSpicy)
    - [Support Discord Server](https://discord.gg/ydepndv) - @sriRacha#1999 