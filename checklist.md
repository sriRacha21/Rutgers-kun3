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
- [x] custom status
- [ ] voting
### QA lol
##### thanks kirt
- [x] filter out bad characters for sounds
- [x] untrack sounds folder (we still want the folder just not most of the files so, add to .gitignore and only track one file)
- [x] refresh sounds every 30 secondsish...