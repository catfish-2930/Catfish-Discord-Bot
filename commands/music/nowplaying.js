const { MessageEmbed } = require('discord.js');
const { format, createBar } = require('../../util/utils.js');

module.exports = {
  name: 'nowplaying',
  aliases: ['np'],
  description: 'nowplaying music',
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
    if (!manager.queue.current) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setTitle(
              client.i18n.__msg('commands.nowplaying.variable1', language)
            ),
        ],
      });
    }
    const track = manager.queue.current;
    const embed = new MessageEmbed()
      .setAuthor({
        name: client.i18n.__msg('commands.nowplaying.variable3', language),
        iconURL: message.guild.iconURL({ dynamic: true }),
      })
      .setThumbnail(track.thumbnail.url)
      .setURL(track.url)
      .setColor('#fe6654')
      .setTitle(
        client.i18n.__msg('commands.nowplaying.variable2', language, {
          state: manager.player.playing ? '▶' : '⏸',
          title: track.title,
        })
      )
      .addField(
        client.i18n.__msg('commands.nowplaying.variable4', language),
        createBar(manager, track)
      )
      .addField(
        client.i18n.__msg('commands.nowplaying.variable5', language),
        `\`${format(track.duration * 1000)}\``,
        true
      )
      .addField(
        client.i18n.__msg('commands.nowplaying.variable6', language),
        `\`${track.author.name}\``,
        true
      )
      .addField(
        client.i18n.__msg('commands.nowplaying.variable7', language),
        `\`${manager.queue.length} Songs\``,
        true
      )
      .setFooter({
        text: client.i18n.__msg('commands.nowplaying.variable8', language, {
          name: track.RequestBy.name,
        }),
        iconURL: track.RequestBy.avatarUrl,
      });
    message.channel.send({ embeds: [embed] });
  },
};
