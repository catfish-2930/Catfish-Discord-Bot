const { MessageEmbed } = require('discord.js');
const { LoopType } = require('../../music/types.js');

module.exports = {
  name: 'loopsong',
  aliases: ['ls'],
  description: 'loop music',
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
    return message.channel.send({ embeds: [embed] });
  },
};
