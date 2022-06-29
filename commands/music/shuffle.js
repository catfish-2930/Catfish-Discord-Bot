const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'shuffle',
  aliases: ['shuffle'],
  description: 'shuffle music',
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
    manager.shuffle();
    const { isShuffle } = manager.queue;
    message.channel.send({
      embeds: [
        new MessageEmbed().setDescription(
          client.i18n.__msg('commands.shuffle.variable1', language, {
            type: isShuffle ? 'Shuffle' : 'Unshuffle',
          })
        ),
      ],
    });
  },
};
