const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'jump',
  aliases: ['jump'],
  description: 'jump',
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
    if (!args[0])
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#e01e01')
            .setTitle(client.i18n.__msg('commands.jump.variable1', language))
            .setDescription(
              `For example: \`!jump ${
                manager.queue.length - 2 <= 0
                  ? manager.queue.length
                  : manager.queue.length - 2
              }\``
            ),
        ],
      });
    const num = Number(args[0]);
    // if userinput is not a Number
    if (Number.isNaN(num))
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#e01e01')
            .setTitle(client.i18n.__msg('commands.jump.variable2', language)),
        ],
      });
    if (num > manager.queue.length || num < 1)
      return message.reply({
        embeds: [
          new MessageEmbed()
            .setColor('#e01e01')
            .setTitle(client.i18n.__msg('commands.jump.variable3', language)),
        ],
      });
    manager.jump(num);
    // Send Success Message
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle(
            client.i18n.__msg('commands.jump.variable4', language, {
              num: num,
            })
          )
          .setColor('#e01e01'),
      ],
    });
  },
};
