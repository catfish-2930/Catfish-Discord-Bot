const { MessageEmbed } = require('discord.js');
const { format, createBar } = require('../../util/utils.js');

function converttime(str) {
  return str
    .split(':')
    .reverse()
    .reduce((prev, curr, i) => prev + curr * 60 ** i, 0);
}

module.exports = {
  name: 'seek',
  aliases: ['ss'],
  description: 'seek music',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    const manager = client.displayer.getManager(message.guild.id);
    if (!manager)
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setDescription(client.i18n.__msg('common.noplaying', language)),
        ],
      });
    if (!manager.player.playing) return false;
    const time = converttime(args[0]);
    if (Number.isNaN(time)) return false;
    if (Number(time) < 0 || Number(time) >= manager.queue.current.duration)
      return message.channel.send({
        embeds: [
          new MessageEmbed().setColor('#e01e01').setTitle(
            client.i18n.__msg('commands.seek.variable1', language, {
              duration: manager.queue.current.duration,
            })
          ),
        ],
      });
    await manager.player.seek(Number(time));
    // send success message
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(
            client.i18n.__msg('commands.seek.variable2', language, {
              time: format(Number(time) * 1000),
            })
          )
          .addField(
            client.i18n.__msg('commands.seek.variable3', language),
            createBar(manager, manager.queue.current)
          )
          .setColor('#fe6654'),
      ],
    });
  },
};
