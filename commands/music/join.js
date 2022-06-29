const { MessageEmbed } = require('discord.js');
const Manager = require('../../music/Manager.js');
const { enterReady } = require('../../music/VoiceUtil.js');

module.exports = {
  name: 'join',
  aliases: ['j'],
  description: 'join',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    const voicechannel = message.member.voice.channel;
    let manager = client.displayer.getManager(message.guild.id);
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
  },
};
