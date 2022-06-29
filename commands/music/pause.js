const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'pause',
  aliases: ['pause'],
  description: 'pause music',
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
    if (!manager.player.playing && manager.queue.current)
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setTitle(client.i18n.__msg('commands.pause.variable1', language))
            .setDescription(
              client.i18n.__msg('commands.pause.variable2', language, {
                prefix: client.config.prefix,
              })
            ),
        ],
      });
    manager.player.pause();
    message.react('⏸️').catch({});
  },
};
