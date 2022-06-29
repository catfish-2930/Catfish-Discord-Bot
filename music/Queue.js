module.exports = class Queue extends Array {
  constructor() {
    super();
    this.current = null;
    this.previous = null;
    this.backupQueue = [];
    this.shuffleQueue = [];
    this.isShuffle = false;
  }

  remove(position = 0) {
    return this.splice(position, 1);
  }

  clear() {
    this.splice(0);
  }

  get size() {
    return this.length;
  }

  shuffle() {
    // eslint-disable-next-line no-plusplus
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
  }
};
