const { Client, Intents, Collection } = require('discord.js');
const { botToken } = require('./config/config');
const i18n = require('./util/i18n.js');
const DisPlayer = require('./music/DisPlayer.js');

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

client.commands = new Collection();
client.displayer = new DisPlayer();
client.i18n = i18n;
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.displayer.init(client);
});

try {
  [
    'initializeClient',
    'managerevents',
    'musicfunction',
    'musicsystem',
    'commands',
  ].forEach((handler) => {
    // eslint-disable-next-line global-require
    require(`./handler/${handler}.js`)(client);
  });
} catch (e) {
  console.log(e);
}

client.on('messageCreate', async (msg) => {
  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const prefixRegex = new RegExp(
    `^(<@!?${client.user.id}>|${escapeRegex(client.config.prefix)})\\s*`
  );
  if (prefixRegex.test(msg.content)) {
    const [matchedPrefix] = msg.content.match(prefixRegex);
    const args = msg.content.slice(matchedPrefix.length).trim().split(/ +/);
    console.log(args);
    const commandName = args.shift().toLowerCase();
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );
    console.log(command);
    if (command) {
      try {
        command.run(msg, args, client);
      } catch (error) {
        console.error(error);
        msg
          .reply('There was an error executing that command.')
          .catch(console.error);
      }
    }
  } else {
    //No command 
  }
});

client.login(botToken);
