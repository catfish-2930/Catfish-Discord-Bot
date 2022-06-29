const {
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
} = require('discord.js');
const Manager = require('../../music/Manager.js');
const { enterReady } = require('../../music/VoiceUtil.js');
const TrackResolver = require('../../music/TrackResolver.js');
const { formatTimeOnly } = require('../../util/utils.js');

module.exports = {
  name: 'search',
  aliases: ['s'],
  description: 'search music',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    const voicechannel = message.member.voice.channel;
    let manager = client.displayer.getManager(message.guild.id);
    if (!args[0])
      return message.channel.send({
        embeds: [
          new MessageEmbed()
            .setColor('#e01e01')
            .setTitle(client.i18n.__msg('commands.search.variable1', language)),
        ],
      });
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
    const resolver = await TrackResolver.searchTracks(args.join(' '), {
      RequestBy: {
        name: message.member.user.tag,
        avatarUrl: message.member.user.displayAvatarURL({ dynamic: true }),
      },
    });
    if (!resolver.tracks.length)
      return message.channel.send({
        embeds: [
          new MessageEmbed().setDescription(
            client.i18n.__msg('commands.search.variable2', language)
          ),
        ],
      });
    const results = resolver.tracks
      .map(
        (track, index) =>
          `**${index + 1})** [\`${String(track.title)
            .substring(0, 60)
            .split('[')
            .join('{')
            .split(']')
            .join('}')}\`](${track.url}) - \`${formatTimeOnly(
            track.duration * 1000
          )}\``
      )
      .join('\n');
    const emojiarray = [
      '1️⃣',
      '2️⃣',
      '3️⃣',
      '4️⃣',
      '5️⃣',
      '6️⃣',
      '7️⃣',
      '8️⃣',
      '9️⃣',
      '🔟',
    ];
    const songoptions = [
      ...emojiarray.slice(0, resolver.tracks.length).map((emoji, index) => ({
        value: `Add ${index + 1}. Track`.substring(0, 25),
        label: `Add ${index + 1}. Track`.substring(0, 25),
        description: `Add: ${resolver.tracks[index].title}`.substring(0, 50),
        emoji: `${emoji}`,
      })),
      {
        value: `Cancel`,
        label: `Cancel`,
        description: client.i18n.__msg('commands.search.variable3', language),
        emoji: '❌',
      },
    ];

    const Selection = new MessageSelectMenu()
      .setCustomId('MenuSelection')
      .setMaxValues(emojiarray.slice(0, resolver.tracks.length).length)
      .setPlaceholder(client.i18n.__msg('commands.search.variable4', language))
      .addOptions(songoptions);
    // send the menu msg
    await message.channel
      .send({
        embeds: [
          new MessageEmbed()
            .setTitle(
              `${`${client.i18n.__msg(
                'commands.search.variable5',
                language
              )} **\`${args.join(' ')}`.substring(0, 256 - 3)}\`**`
            )
            .setColor('#fe6654')
            .setDescription(results)
            .setFooter({
              text: `${client.i18n.__msg(
                'commands.search.variable6',
                language
              )}${resolver.RequestBy.name}`,
              iconURL: resolver.RequestBy.avatarUrl,
            }),
        ],
        components: [new MessageActionRow().addComponents(Selection)],
      })
      .then((menumsg) => {
        const collector = menumsg.createMessageComponentCollector({
          filter: (i) => i.isSelectMenu() && i.user,
          time: 90000,
        });
        collector.on('collect', async (menu) => {
          collector.stop();
          menu.deferUpdate();

          if (menu.values[0] === 'Cancel') {
            // eslint-disable-next-line no-return-await
            return await menumsg
              .edit({
                embeds: [
                  menumsg.embeds[0]
                    .setTitle(
                      client.i18n.__msg('commands.search.variable7', language)
                    )
                    .setDescription(
                      client.i18n.__msg('commands.search.variable8', language)
                    )
                    .setColor('#e01e01'),
                ],
                components: [],
              })
              .catch(() => {});
          }

          const pickedSongs = [];
          const toAddTracks = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const value of menu.values) {
            const songIndex = songoptions.findIndex((d) => d.value === value);
            const track = resolver.tracks[songIndex];
            toAddTracks.push(track);
            pickedSongs.push(
              `**${songIndex + 1})** [\`${String(track.title)
                .substring(0, 60)
                .split('[')
                .join('\\[')
                .split(']')
                .join('\\]')}\`](${track.uri}) - \`${formatTimeOnly(
                track.duration * 1000
              )}\``
            );
          }
          await menumsg.edit({
            embeds: [
              menumsg.embeds[0]
                .setTitle(
                  client.i18n.__msg('commands.search.variable9', language)
                )
                .setDescription(pickedSongs.join('\n\n')),
            ],
            components: [],
            // content: `${collected && collected.first() && collected.first().values ? `👍 **Selected: \`${collected ? collected.map(s => s.value).join(", ") : "Nothing"}\`**` : "❌ **NOTHING SELECTED - CANCELLED**" }`,
          });
          manager.addTrackArray(toAddTracks);
          return true;
        });
        // eslint-disable-next-line no-unused-vars
        collector.on('end', (collected) => {});
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
