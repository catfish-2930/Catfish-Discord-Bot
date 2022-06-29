const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'filterlist',
  aliases: ['lft'],
  description: 'filter list',
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
    const result = manager.player._filters
      .map(
        (v, i) =>
          `${i + 1} - ${v.name} ${v.value ? ':white_check_mark:' : ':x:'}`
      )
      .join('\n');
    return message.channel.send({
      embeds: [
        {
          color: '#fe6654',
          fields: [{ name: 'Filters', value: result, inline: true }],
        },
      ],
    });
  },
};
