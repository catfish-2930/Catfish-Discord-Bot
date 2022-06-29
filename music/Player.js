const { StreamType, createAudioResource } = require('@discordjs/voice');
const playdl = require('play-dl');
const DiscordYtdl = require('discord-ytdl-core');
const { Bstream } = require('./extractor/bilibili/index.js');
const { opustream } = require('./customestream.js');
const { SourceType, LoopType } = require('./types.js');
const { createDefaultFilters, CreateFilterString } = require('./filter.js');

module.exports = class Player {
  constructor(manager) {
    this.manager = manager;
    this.playing = false;
    this._streamTime = 0;
    this.trackLoop = false;
    this.queueLoop = false;
    this.filterUpdate = false;
    this.forceskip = false;
    this._filters = createDefaultFilters();
  }

  async setFilters(filters) {
    this._streamTime = this.streamTime * 1000;
    if ((!filters || !Array.isArray(filters)) && this.manager.queue.current) {
      this._filters = createDefaultFilters();
    } else {
      this._filters = filters;
    }
    if (this.manager.queue.current) {
      this.filterUpdate = true;
      this.manager.voice.end();
    }
    return true;
  }

  get streamTime() {
    return (this.manager.voice.streamTime + this._streamTime) / 1000;
  }

  set streamTime(time) {
    this._streamTime = time * 1000;
  }

  setLoop(looptype) {
    switch (looptype) {
      case LoopType.SONG:
        this.trackLoop = true;
        this.queueLoop = false;
        break;
      case LoopType.QUEUE:
        this.queueLoop = true;
        this.trackLoop = false;
        this.manager.queue.backupQueue = [];
        this.manager.queue.backupQueue.push(...this.manager.queue);
        this.manager.queue.backupQueue.push(this.manager.queue.current);
        break;
      case LoopType.OFF:
        this.trackLoop = false;
        this.queueLoop = false;
        this.manager.queue.backupQueue = [];
        break;
      default:
        break;
    }
  }

  async seek(position) {
    if (!this.manager.queue.current || !this.playing) return false;
    // eslint-disable-next-line no-param-reassign
    if (position < 0) position = 0;
    if (position >= this.manager.queue.current.duration) this.skip();
    this.streamTime = position;
    await this.playTrack(this.manager.queue.current, { seek: position });
    return true;
  }

  async playTrack(track, options = { seek: 0, filters: this._filters }) {
    let stream = {
      stream: null,
      type: StreamType.Opus,
    };
    try {
      switch (track.source) {
        case SourceType.YOUTUBE:
          if (track.duration > 10 * 60 || track.extra?.isLive) {
            stream = await playdl.stream(track.url, {
              quality: 2,
              seek: options.seek,
            });
          } else {
            stream.stream = DiscordYtdl(track.url, {
              quality: 'highestaudio',
              dlChunkSize: 0,
              // eslint-disable-next-line no-bitwise
              highWaterMark: 1 << 26,
              liveBuffer: 80000,
              seek: options.seek,
              bitrate: 128000,
              fmt: 's16le',
              opusEncoded: true,
              encoderArgs: CreateFilterString(options.filters),
            });
          }
          break;
        case SourceType.BILIBILI:
          {
            const song = await Bstream(track.url);
            stream.stream = opustream(song.stream, {
              encoderArgs: CreateFilterString(options.filters),
              seek: options.seek,
            });
          }
          break;
        default:
          break;
      }
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type,
        inlineVolume: true,
      });
      this.manager.voice.playStream(resource);
    } catch (err) {
      console.log(err);
      this.forceskip = true;
      this.manager.voice.emit('finish');
      this.manager.emitEv('playerError', err);
    }
  }

  pause() {
    if (!this.manager.queue.current) return false;
    this.playing = false;
    return this.manager.voice.pause();
  }

  resume() {
    if (!this.manager.queue.current) return false;
    this.playing = true;
    return this.manager.voice.resume();
  }

  skip() {
    if (!this.manager.queue.length && !this.manager.queue.current) return false;
    this.forceskip = true;
    this.filterUpdate = false;
    this.manager.voice.end();
    return true;
  }
};
