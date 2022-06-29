module.exports = class Timer {
  constructor(time) {
    this.time = time;
    this.timer = null;
  }

  start(cb) {
    if (!this.timer) this.timer = setTimeout(cb, this.time);
  }

  end() {
    clearTimeout(this.timer);
    this.timer = null;
  }

  get Hastimer() {
    return !!this.timer;
  }

  clear() {
    if (this.timer) this.timer = null;
  }
};
