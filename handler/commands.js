const { readdirSync } = require('fs');

module.exports = (client) => {
  try {
    readdirSync('./commands').forEach((dir) => {
      // console.log(dir);
      const commands = readdirSync(`./commands/${dir}/`).filter((f) =>
        f.endsWith('.js')
      );
      // console.log(commands);
      // eslint-disable-next-line no-restricted-syntax
      for (const file of commands) {
        // eslint-disable-next-line global-require
        const pull = require(`../commands/${dir}/${file}`);

        if (pull.name) {
          client.commands.set(pull.name, pull);
          // console.log(`Loaded Command: ${pull.name}`);
        } else {
          console.log(`No name on Command: /commands/${dir}/${file}`);
        }
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-unused-expressions
    console.log(err);
  }
};
