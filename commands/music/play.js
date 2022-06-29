const { MessageEmbed } = require('discord.js');
const Manager = require('../../music/Manager.js');
const { enterReady } = require('../../music/VoiceUtil.js');
const TrackResolver = require('../../music/TrackResolver.js');

module.exports = {
  name: 'play',
  aliases: ['p'],
  description: 'play music',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    const voicechannel = message.member.voice.channel;
    let manager = client.displayer.getManager(message.guild.id);
    if (!args[0]) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setDescription(client.i18n.__msg('commands.play.noarg', language))
            .setColor('#fe6654'),
        ],
      });
    }
    if (!voicechannel)
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setDescription(client.i18n.__msg('commands.play.joinvc', language))
            .setColor('#fe6654'),
        ],
      });
    if (manager && voicechannel !== message.guild.me.voice.channel) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setDescription(client.i18n.__msg('commands.play.invc', language))
            .setColor('#fe6654'),
        ],
      });
    }
    if (!manager) {
      manager = new Manager(client.displayer, voicechannel, message);
      await manager.join();
      client.displayer.setManager(manager, message.guild.id);
    }
    try {
      await enterReady(manager.connection);
    } catch (err) {
      console.log(err);
    }
    const searchMsg = await message.channel.send({
      embeds: [
        new MessageEmbed()
          .setDescription(
            client.i18n.__msg('commands.play.searching', language, {
              title: args.join(' '),
            })
          )
          .setColor('#fe6654'),
      ],
    });
    const resolveTrack = await TrackResolver.search(args.join(' '), {
      RequestBy: {
        name: message.member.user.tag,
        avatarUrl: message.member.user.displayAvatarURL({ dynamic: true }),
      },
    });
    if (searchMsg.deletable) await searchMsg.delete().catch({});
    if (resolveTrack instanceof Error)
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setDescription(
              client.i18n.__msg('commands.play.error', language, {
                msg: resolveTrack.message.substring(0, 256),
              })
            )
            .setColor('#fe6654'),
        ],
      });
    if (resolveTrack.tracks.length === 0) {
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setDescription(
              client.i18n.__msg('commands.play.notfound', language)
            )
            .setColor('#fe6654'),
        ],
      });
    }
    manager.addTrackResolver(resolveTrack);
  },
};
