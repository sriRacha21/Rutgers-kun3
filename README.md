# Rutgers-kun3

A complete rewrite of the Rutgers-kun Discord bot built for the Rutgers Esports Discord. Old version is hosted [here](https://github.com/sriRacha21/Rutgers-kun).

### How to Use
[Click me to add me to your server!](https://discordapp.com/api/oauth2/authorize?client_id=662131823278817280&permissions=0&scope=bot)

### How to run me locally!
1. Clone me somewhere you feel comfortable keeping Github projects: `git clone https://github.com/sriRacha21/Rutgers-kun3.git`
2. Edit `api_keys.json.dist` and replace the "your token here text" with your API token (surrounded by double quotation marks), obtained from the Discord developer portal. Rename the file to `api_keys.json`.
3. Edit `email_logging.json.dist` and rename it `email_logging.json`. If you are forking the project, you can edit this file to email you on errors.
4. Edit `smtp_server.json.dist` with your SMTP server's details. Rename the file to `smtp_server.json`.
5. cd to root directory of the project.
6. `npm install`
7. `node main.js`

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
- [ ] mute
- [ ] ignore
- [ ] agree
- [x] listadmincommands (already solved with commando)
- [ ] query 
- [ ] filter
- [ ] warn
- [ ] echo
- [x] nick (not really needed)
- [ ] updaterules
- [ ] filterfromlive
- [ ] dm
- [ ] setroleresponse
- [ ] setpingexception
- [ ] setautoverify
- [ ] settransactionchannel
- [x] djs (replaced by eval)
### New command ideas
- [x] latex interpreter
### Extra
- [ ] Live role
- [x] chain counting
- [ ] verify competitive roles (use approval framework)
- [ ] karma system for helpful users
- [x] send email on error through winston
- [x] write function to turn object fields into email body