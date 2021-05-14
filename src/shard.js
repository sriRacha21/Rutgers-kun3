const fs = require('fs');

const defaults = fs.existsSync('settings/default_settings.json') ? JSON.parse(fs.readFileSync('settings/default_settings.json', 'utf-8')) : { err: true };
const apiKeys = fs.existsSync('settings/api_keys.json') ? JSON.parse(fs.readFileSync('settings/api_keys.json', defaults.encoding)) : { token: '' };

const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./main.js', { token: apiKeys.token });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));
manager.spawn();
