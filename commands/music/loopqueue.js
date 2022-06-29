const { MessageEmbed } = require('discord.js');
const { LoopType } = require('../../music/types.js');

module.exports = {
  name: 'loopqueue',
  aliases: ['lq'],
  description: 'loop queue',
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
    const embed = new MessageEmbed()
      .setTitle(
        manager.player.queueLoop
          ? client.i18n.__msg('commands.loop.queue.disabled', language)
          : client.i18n.__msg('commands.loop.queue.enabled', language)
      )
      .setColor('#fe6654');
    if (manager.player.trackLoop) {
      embed.setDescription(
        client.i18n.__msg('commands.loop.andsong', language)
      );
    }
    manager.player.setLoop(LoopType.QUEUE);
    return message.channel.send({ embeds: [embed] });
  },
};
