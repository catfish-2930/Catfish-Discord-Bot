const { MessageEmbed } = require('discord.js');
const { format } = require('../util/utils');

module.exports = (client) => {
  const { language } = client.config;
  client.displayer
    .on('joinVoiceChannel', (manager) => {
      manager.textChannel.send({
        embeds: [
          new MessageEmbed().setDescription(
            client.i18n.__msg('commands.play.joinVoiceChannel', language, {
              voiceChannel: manager.voiceChannel.id,
            })
          ),
        ],
      });
    })
    .on('trackAdd', (manager, track) => {
      const embed = new MessageEmbed()
        .setDescription(
          client.i18n.__msg('commands.play.trackAdd.description', language, {
            title: track.title,
            url: track.url,
          })
        )
        .setColor('#fe6654')
        .setThumbnail(track.thumbnail.url)
        .addFields(
          {
            name: client.i18n.__msg(
              'commands.play.trackAdd.duration',
              language
            ),
            value: ` \`${
              track.extra?.isLive
                ? client.i18n.__msg('commands.play.trackAdd.live', language)
                : format(track.duration * 1000)
            }\``,
          },
          {
            name: client.i18n.__msg('commands.play.trackAdd.songby', language),
            value: ` \`${track.author.name}\``,
          },
          {
            name: client.i18n.__msg('commands.play.trackAdd.ql', language),
            value: ` \`${manager.queue.length} Songs\``,
          }
        );
      return manager.textChannel.send({
        embeds: [embed],
      });
    })
    .on('playlistAdd', (manager, tracks, playlist) => {
      const duration = tracks.reduce((s, p) => s + p.duration, 0);
      const playlistembed = new MessageEmbed()
        .setTitle(
          client.i18n.__msg('commands.play.playlistAdd.variable1', language, {
            title: playlist.title,
          })
        )
        .setURL(playlist.url)
        .setColor('#fe6654')
        .setThumbnail(playlist.thumbnail.url)
        .addFields(
          {
            name: client.i18n.__msg(
              'commands.play.playlistAdd.variable2',
              language
            ),
            value: ` \`${format(duration * 1000)}\``,
          },
          {
            name: client.i18n.__msg(
              'commands.play.playlistAdd.variable3',
              language
            ),
            value: ` \`${tracks.length} Songs\``,
          }
        )
        .setFooter({
          text: client.i18n.__msg(
            'commands.play.playlistAdd.variable4',
            language,
            {
              name: tracks[0].RequestBy.name,
            }
          ),
          iconURL: tracks[0].RequestBy.avatarUrl,
        });
      return manager.textChannel.send({
        embeds: [playlistembed],
      });
    })
    .on('tracksAdd', (manager, tracks) => {
      const duration = tracks.reduce((s, p) => s + p.duration, 0);
      const playlistembed = new MessageEmbed()
        .setTitle(
          client.i18n.__msg('commands.play.tracksAdd.variable1', language)
        )
        .setColor('#fe6654')
        .setThumbnail(tracks[0].thumbnail.url)
        .addFields(
          {
            name: client.i18n.__msg(
              'commands.play.tracksAdd.variable2',
              language
            ),
            value: ` \`${format(duration * 1000)}\``,
          },
          {
            name: client.i18n.__msg(
              'commands.play.tracksAdd.variable3',
              language
            ),
            value: ` \`${tracks.length} Songs\``,
          }
        )
        .setFooter({
          text: client.i18n.__msg(
            'commands.play.tracksAdd.variable4',
            language,
            {
              name: tracks[0].RequestBy.name,
            }
          ),
          iconURL: tracks[0].RequestBy.avatarUrl,
        });
      return manager.textChannel.send({
        embeds: [playlistembed],
      });
    })
    .on('disconnect', (manager) => {
      const embed = new MessageEmbed().setColor('#fe6654').setDescription(
        client.i18n.__msg('commands.disconnect.variable1', language, {
          voice: manager.voiceChannel.id,
        })
      );
      return manager.textChannel.send({
        embeds: [embed],
      });
    })
    .on('playerError', (manager, err) => {
      console.log(err);
      return manager.textChannel.send({
        embeds: [
          new MessageEmbed().setDescription(
            client.i18n.__msg('common.error', language, {
              msg: String(err.message).substring(0, 256),
            })
          ),
        ],
      });
    });
};
