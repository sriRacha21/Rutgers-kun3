const wetty = require('wetty.js');

const config = JSON.parse(require('fs').readFileSync('settings/tty_settings.json', 'utf-8'));
const url = require('url').parse(config.url);

// Wetty options
const ssh = {
    user: '',
    host: config.ssh_host,
    auth: 'password',
    port: config.ssh_port
};
const main = {
    base: url.pathname,
    port: url.port || 443,
    host: '0.0.0.0'
};
const cmd = '';
const ssl = {
    cert: config.tls_public,
    key: config.tls_private
};

wetty.start(ssh, main, cmd, ssl);

// Exit after the last session closes
let spawned = false;
let refs = 0;

wetty.on('spawn', () => {
    refs++;
    spawned = true;
});

wetty.on('exit', () => {
    refs--;
    if (refs == 0) process.exit(0);
});

// Exit if no sessions are initiated after the timeout
config.timeout && setTimeout(() => !spawned && process.exit(0), config.timeout);
