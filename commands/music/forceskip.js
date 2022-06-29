const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'forceskip',
  aliases: ['fs'],
  description: 'forceskip music',
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
      manager.player.resume();
    manager.player.skip();
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setColor('#fe6654')
          .setTitle(client.i18n.__msg('commands.forceskip.title2', language)),
      ],
    });
  },
};
