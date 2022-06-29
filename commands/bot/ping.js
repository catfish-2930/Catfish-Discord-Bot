const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'ping',
  aliases: ['ping'],
  description: 'ping',
  // eslint-disable-next-line consistent-return
  run: async (message, args, client) => {
    const { language } = client.config;
    const manager = client.displayer.getManager(message.guild.id);
    const latency = new MessageEmbed()
      .setTitle(client.i18n.__msg('commands.ping.variable1', language))
      .addFields([
        {
          name: client.i18n.__msg('commands.ping.variable2', language),
          value: `\`${Math.round(client.ws.ping)}ms\``,
        },
        {
          name: client.i18n.__msg('commands.ping.variable3', language),
          value: manager
            ? `UDP: \`${
                manager?.connection.ping.udp ?? 'N/A'
              }\`ms\nWebSocket: \`${manager?.connection.ping.ws ?? 'N/A'}\`ms`
            : 'N/A',
        },
      ])
      .setColor('#FBB117');
    message.channel.send({ embeds: [latency] });
  },
};
