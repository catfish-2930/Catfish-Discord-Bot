const { MessageEmbed } = require('discord.js');
const {
  filterLength,
  getKey,
  createDefaultFilters,
} = require('../../music/filter');

module.exports = {
  name: 'filter',
  aliases: ['ft'],
  description: 'filter',
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
    const length = filterLength();
    if (!args[0])
      return message.channel.send({
        embeds: [
          new MessageEmbed().setColor('#fe6654').setDescription(
            client.i18n.__msg('commands.filter.variable2', language, {
              end: length,
            })
          ),
        ],
      });
    const arg = Number(args[0]);
    if (Number.isNaN(arg) || arg > length || arg < 1) {
      return message.channel.send({
        embeds: [
          new MessageEmbed().setColor('#fe6654').setDescription(
            client.i18n.__msg('commands.filter.variable1', language, {
              end: length,
            })
          ),
        ],
      });
    }
    const key = getKey(arg);
    const filters = manager.player._filters;
    const result = createDefaultFilters();
    if (filters[arg - 1].value) {
      result[arg - 1].value = false;
    } else {
      result[arg - 1].value = true;
    }
    manager.player.setFilters(result);
    if (!message.channel) return false;
    const embed = new MessageEmbed()
      .setColor('#fe6654')
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setTitle(
        client.i18n.__msg('commands.filter.variable3', language, {
          name: key,
          state: result[arg - 1].value ? '✅ On ' : '❌ Off',
        })
      )
      .setDescription(
        `${client.i18n.__msg('commands.filter.variable4', language)}\n${
          manager.queue?.current && manager.queue.current.duration > 10 * 60
            ? client.i18n.__msg('commands.filter.variable5', language)
            : ''
        }`
      );
    return message.channel.send({
      embeds: [embed],
    });
  },
};
