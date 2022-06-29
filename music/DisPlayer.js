const EventEmittter = require('events');

module.exports = class DisPlayer extends EventEmittter {
  constructor() {
    super();
    this.client = null;
    this.managers = new Map();
  }

  init(client) {
    this.client = client;
  }

  setManager(manager, guildId) {
    this.managers.set(guildId, manager);
  }

  getManager(guildId) {
    return this.managers.get(guildId);
  }

  deleteManager(guildId) {
    return this.managers.delete(guildId);
  }
};
