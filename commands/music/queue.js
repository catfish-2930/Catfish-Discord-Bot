const { MessageEmbed } = require('discord.js');
const { formatTimeOnly, swapPages2 } = require('../../util/utils.js');

module.exports = {
  name: 'queue',
  aliases: ['q'],
  description: 'queue music',
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
    const { queue } = manager;
    if (!queue.length && !queue.current) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#fe6654')
            .setDescription(client.i18n.__msg('common.noplaying', language)),
        ],
      });
    }
    if (!queue.length) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: client.i18n.__msg('commands.queue.variable1', language, {
                name: message.guild.name,
              }),
              iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .setColor('#fe6654')
            .addField(
              client.i18n.__msg('commands.queue.variable2', language),
              `**${queue.current.title.substring(0, 60)}** - \`${
                queue.current.extra?.isLive
                  ? client.i18n.__msg('commands.queue.variable3', language)
                  : formatTimeOnly(queue.current.duration * 1000)
              }\``
            )
            .addField(
              client.i18n.__msg('commands.queue.variable4', language),
              client.i18n.__msg('commands.queue.variable5', language)
            ),
        ],
      });
    }
    if (queue.length < 5)
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setAuthor({
              name: client.i18n.__msg('commands.queue.variable6', language, {
                name: message.guild.name,
                length: queue.length,
              }),
              iconURL: message.guild.iconURL({ dynamic: true }),
            })
            .addField(
              client.i18n.__msg('commands.queue.variable7', language),
              `**[${queue.current.title.substring(0, 60)}](${
                queue.current.url
              })** - \`${
                queue.current.extra?.isLive
                  ? client.i18n.__msg('commands.queue.variable3', language)
                  : formatTimeOnly(queue.current.duration * 1000)
              }\`\n> ${client.i18n.__msg('commands.queue.variable8', language, {
                name: queue.current.RequestBy.name,
              })}`
            )
            .setColor('#fe6654')
            .addField(
              client.i18n.__msg('commands.queue.variable4', language),
              queue
                .map(
                  (track, index) =>
                    // eslint-disable-next-line no-param-reassign
                    `**\` ${index + 1}. \`${`[${track.title.substring(
                      0,
                      60
                    )}](${track.url})`}** - \`${
                      track.extra?.isLive
                        ? client.i18n.__msg(
                            'commands.queue.variable3',
                            language
                          )
                        : formatTimeOnly(track.duration * 1000)
                    }\`\n> ${client.i18n.__msg(
                      'commands.queue.variable8',
                      language,
                      {
                        name: track.RequestBy.name,
                      }
                    )}`
                )
                .join(`\n`)
            ),
        ],
      });

    const quelist = [];
    const maxTracks = 5; // tracks / Queue Page
    for (let i = 0; i < queue.length; i += maxTracks) {
      const songs = queue.slice(i, i + maxTracks);
      quelist.push(
        songs
          .map(
            (track, index) =>
              `**\` ${i + index + 1}. \`${`[${track.title
                .substring(0, 60)
                // eslint-disable-next-line prettier/prettier
                .replace(/\[/giu, '\\[')
                // eslint-disable-next-line prettier/prettier
                .replace(/\]/giu, '\\]')}](${track.url})`}** - \`${
                track.extra?.isLive
                  ? client.i18n.__msg('commands.queue.variable3', language)
                  : formatTimeOnly(track.duration * 1000)
              }\`\n> ${client.i18n.__msg('commands.queue.variable8', language, {
                name: track.RequestBy.name,
              })}`
          )
          .join(`\n`)
      );
    }
    const limit = quelist.length;
    let leftTracks = queue.length;
    const embeds = [];
    for (let i = 0; i < limit; i += 1) {
      leftTracks = leftTracks < 5 ? 0 : (leftTracks -= maxTracks);
      const desc = String(quelist[i]).substring(0, 1024);

      embeds.push(
        new MessageEmbed()
          .setAuthor({
            name: client.i18n.__msg('commands.queue.variable6', language, {
              name: message.guild.name,
              length: queue.length,
            }),
            iconURL: message.guild.iconURL({ dynamic: true }),
          })
          .setColor('#fe6654')
          .addField(
            client.i18n.__msg('commands.queue.variable7', language),
            `**${`[${queue.current.title
              .substring(0, 60)
              // eslint-disable-next-line prettier/prettier
              .replace(/\[/giu, '\\[')
              // eslint-disable-next-line prettier/prettier
              .replace(/\]/giu, '\\]')}](${queue.current.url})`}** - \`${
              queue.current.extra?.isLive
                ? client.i18n.__msg('commands.queue.variable3', language)
                : formatTimeOnly(queue.current.duration * 1000)
            }\`\n> ${client.i18n.__msg('commands.queue.variable8', language, {
              name: queue.current.RequestBy.name,
            })}`
          )
          .addField(
            client.i18n.__msg('commands.queue.variable4', language),
            desc
          )
          .addField(
            client.i18n.__msg('commands.queue.variable9', language, {
              left1: leftTracks,
              left2: leftTracks,
            }),
            `\u200b`
          )
      );
    }
    return swapPages2(client, message, embeds);
  },
};
