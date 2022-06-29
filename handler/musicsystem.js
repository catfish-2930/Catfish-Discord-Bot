const { LoopType } = require('../music/types.js');

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton() && !interaction.isSelectMenu()) return;
    const actionList = ['Skip', 'Stop', 'Pause', 'Shuffle', 'Song', 'Queue'];
    if (!actionList.includes(interaction.customId)) return;
    // eslint-disable-next-line prefer-const
    let { guild, channel, member, user, message } = interaction;
    if (!message.author.id === client.user.id) return;
    if (!guild) guild = client.guilds.cache.get(interaction.guildId);
    if (!guild) return;
    if (!channel) channel = guild.channels.cache.get(interaction.channelId);
    if (!channel) return;
    if (!member) member = guild.members.cache.get(user.id);
    if (!member) member = await guild.members.fetch(user.id).catch(() => {});
    if (!member) return;

    const manager = client.displayer.getManager(interaction.guild.id);
    if (!manager || !manager.queue || !manager.queue.current) {
      // eslint-disable-next-line consistent-return
      return interaction.update({ components: [] }).catch(() => {});
    }
    const { player, queue } = manager;
    switch (interaction.customId) {
      case 'Skip':
        await interaction.deferUpdate();
        if (!manager.player.playing && manager.queue.current)
          manager.player.resume();
        manager.player.skip();
        break;
      case 'Stop':
        await interaction.deferUpdate();
        queue.clear();
        if (!manager.player.playing && manager.queue.current)
          manager.player.resume();
        manager.player.skip();
        break;
      case 'Pause':
        await interaction.deferUpdate();
        if (player.playing && manager.queue.current) {
          player.pause();
        } else if (!player.playing && manager.queue.current) {
          player.resume();
        }
        client.updatemusicsystem(manager);
        break;
      case 'Shuffle':
        manager.shuffle();
        await interaction.deferUpdate();
        client.updatemusicsystem(manager);
        break;
      case 'Song':
        if (player.trackLoop) {
          player.setLoop(LoopType.OFF);
        } else {
          player.setLoop(LoopType.SONG);
        }
        await interaction.deferUpdate();
        client.updatemusicsystem(manager);
        break;
      case 'Queue':
        if (player.queueLoop) {
          player.setLoop(LoopType.OFF);
        } else {
          player.setLoop(LoopType.QUEUE);
        }
        await interaction.deferUpdate();
        client.updatemusicsystem(manager);
        break;
      default:
        break;
    }
  });
};
