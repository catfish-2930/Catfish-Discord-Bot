const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'leave',
  aliases: ['out'],
  description: 'leave',
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
    const voice = manager.voiceChannel.id;
    manager.leave();
    message.channel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            client.i18n.__msg('commands.leave.variable1', language, {
              voice: voice,
            })
          )
          .setColor('#fe6654'),
      ],
    });
  },
};
