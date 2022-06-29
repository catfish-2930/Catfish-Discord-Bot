const { generateQueueEmbed } = require('../util/utils.js');

module.exports = (client) => {
  // eslint-disable-next-line no-param-reassign
  client.createmusicSystem = async (manager, track) => {
    const embed = generateQueueEmbed(client, manager, track);
    manager.textChannel
      .send(embed)
      .then((interactionMsg) => {
        manager.setInteractionMsg(interactionMsg);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // eslint-disable-next-line no-param-reassign
  client.updatemusicsystem = async (manager) => {
    const msg = manager.getInteractionMsg();
    if (!msg) return false;
    if (!msg.editable)
      return client.createmusicSystem(manager, manager.queue.current);
    const embed = generateQueueEmbed(client, manager, manager.queue.current);
    msg
      .edit(embed)
      .then((newmsg) => {
        manager.setInteractionMsg(newmsg);
      })
      .catch((e) => {
        console.log(e);
      });
    return true;
  };

  // eslint-disable-next-line no-param-reassign
  client.deletemusicsystem = async (manager) => {
    const msg = manager.getInteractionMsg();
    if (!msg || !msg.editable) return false;
    await msg.edit({ components: [] }).catch(() => {});
    manager.setInteractionMsg(null);
    return true;
  };
};
