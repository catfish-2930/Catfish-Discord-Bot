module.exports = {
  name: 'uptime',
  aliases: ['up'],
  description: 'uptime',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    let seconds = Math.floor(client.uptime / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    seconds %= 60;
    minutes %= 60;
    hours %= 24;

    return message.channel
      .send(
        client.i18n.__msg('commands.uptime.variable1', language, {
          d: days,
          h: hours,
          m: minutes,
          s: seconds,
        })
      )
      .catch(console.error);
  },
};
