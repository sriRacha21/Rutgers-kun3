# Rutgers-kun3
A complete rewrite of the Rutgers-kun Discord bot built for the Rutgers Esports Discord. Old version is hosted [here](https://github.com/sriRacha21/Rutgers-kun).

### How to Use
[Click me to add me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=662131823278817280&permissions=0&scope=bot)

### How to run me locally!
1. Clone me somewhere you feel comfortable keeping Github projects: `git clone https://github.com/sriRacha21/Rutgers-kun3.git`
2. Edit `api_keys.json.dist` and replace the "your token here text" with your API token (surrounded by double quotation marks), obtained from the Discord developer portal. Rename the file to `api_keys.json`.
3. Edit `email_logging.json.dist` and rename it `email_logging.json`. If you are forking the project, you can edit this file to email you on errors. **(OPTIONAL)**
4. Edit `smtp_server.json.dist` with your SMTP server's details. Rename the file to `smtp_server.json`. **(OPTIONAL)**
5. Rename `netids.json.dist` to `netids.json` to start recording netID's (to check if a user is already verified). **(OPTIONAL)**
6. `cd` to root directory of the project.
7. `npm install`
8. `node main.js`

## TODO List
### Reimplementing unprivileged old commands
- [x] help (done by default with commando)
- [x] role (skipping in favor of role reactions from yagpdb)
- [x] ping (done by default with commando)
- [x] 8ball 
- [x] love
- [x] roll
- [x] woof
- [x] meow
- [x] execute (skipping in favor of built-in eval for now)
- [x] play (soundboard commands in general) - working on this
- [x] leave
- [x] custom commands
- [x] addemote
- [x] huh (skipping because of lack of importance and potential load on db)
- [x] quote
- [x] chain
- [x] config (in favor of multiple configuration commands)
- [x] setword (think about rename)
- [x] whoami
### Reimplenting privileged old commands
- [x] mute
- [x] ignore (unneeded)
- [x] agree
- [x] listadmincommands (already solved with commando)
- [x] query 
- [x] filter (managed through yagpdb)
- [x] warn (managed through yagpdb)
- [x] echo
- [x] nick (not really needed)
- [x] updaterules (not needed because warns are through yagpdb)
- [x] filterfromlive (unneeded, check off when live role functionality is done)
- [x] dm (correspondence through dm is not possible because dm's aren't logged so this is unncessary)
- [x] setroleresponse
- [x] setpingexception (covered by setunpingableroles)
- [x] setautoverify
- [x] settransactionchannel (i simply don't want to do this)
- [x] djs (replaced by eval)
### New command ideas
- [x] latex interpreter
### Extra
- [x] Live role
- [x] chain counting
- [x] audit logging
- [x] verify competitive roles (use approval framework)
- [x] karma system for helpful users (decided not to do this, may be revisited)
- [x] send email on error through winston
- [x] write function to turn object fields into email body
- [x] write agreement emails to (gitignored) file so that we don't have to reverify users that left and rejoined
### QA lol
##### thanks kirt
- [x] filter out bad characters for sounds
- [x] untrack sounds folder (we still want the folder just not most of the files so, add to .gitignore and only track one file)
- [x] refresh sounds every 30 secondsish...