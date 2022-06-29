const { MessageEmbed } = require('discord.js');
const { LoopType } = require('../../music/types.js');

module.exports = {
  name: 'loop',
  aliases: ['l'],
  description: 'loop',
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
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setTitle(client.i18n.__msg('commands.loop.errortitle', language))
            .setDescription(
              client.i18n.__msg('commands.loop.errordescription', language)
            ),
        ],
      });
    }
    const arg = args[0].toLowerCase();
    if (arg === 'song' || arg === 'track' || arg === 's' || arg === 't') {
      const embed = new MessageEmbed()
        .setTitle(
          manager.player.trackLoop
            ? client.i18n.__msg('commands.loop.track.disabled', language)
            : client.i18n.__msg('commands.loop.track.enabled', language)
        )
        .setColor('#fe6654');
      if (manager.player.queueLoop) {
        embed.setDescription(
          client.i18n.__msg('commands.loop.andqueue', language)
        );
      }
      manager.player.setLoop(LoopType.SONG);
      message.channel.send({ embeds: [embed] });
    } else if (arg === 'queue' || arg === 'qu' || arg === 'q') {
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
      message.channel.send({ embeds: [embed] });
    } else if (arg === 'off' || arg === 'stop') {
      const embed = new MessageEmbed()
        .setTitle(client.i18n.__msg('commands.loop.queue.disabled', language))
        .setColor('#fe6654')
        .setDescription(client.i18n.__msg('commands.loop.andsong', language));
      manager.player.setLoop(LoopType.OFF);
      message.channel.send({ embeds: [embed] });
    } else {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setTitle(client.i18n.__msg('commands.loop.errortitle', language))
            .setDescription(
              client.i18n.__msg('commands.loop.errordescription', language)
            ),
        ],
      });
    }
  },
};
