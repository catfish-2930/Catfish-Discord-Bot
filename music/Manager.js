const Queue = require('./Queue.js');
const { join, enterReady, disconnect } = require('./VoiceUtil.js');
const Timer = require('./timer.js');
const Voice = require('./Voice.js');
const Player = require('./Player.js');
const { ResultType } = require('./types.js');

module.exports = class Manager {
  constructor(displayer, voiceChannel, message) {
    this.guild = voiceChannel.guild;
    this.queue = new Queue();
    this.displayer = displayer;
    this.player = new Player(this);
    this.voiceChannel = voiceChannel;
    this.message = message;
    this.textChannel = message.channel;
    this.connection = null;
    this.voice = null;
    this.state = {
      firstTrack: true,
    };
    this.timer = new Timer(10 * 60 * 1000);
    this.interactionMsg = null;
  }

  async join(voiceChannel = this.voiceChannel) {
    if (!voiceChannel) return;
    if (!this.connection) this.connection = await join(voiceChannel);
    await enterReady(this.connection);
    this.voice = new Voice(this.voiceChannel, this.connection);
    this.emitEv('joinVoiceChannel');
    this.setEvents();
    // eslint-disable-next-line consistent-return
    return this.connection;
  }

  async setInteractionMsg(message) {
    this.interactionMsg = message;
  }

  getInteractionMsg() {
    return this.interactionMsg;
  }

  emitEv(event, ...args) {
    this.displayer.emit(event, this, ...args);
  }

  setEvents() {
    // events
    this.voice
      .on('start', () => {
        if (this.timer.Hastimer) this.timer.end();
        this.player.playing = true;
        this.emitEv('trackStart', this.queue.current ?? this.queue[0]);
        if (this.state.firstTrack) {
          this.displayer.client.createmusicSystem(
            this,
            this.queue.current ?? this.queue[0]
          );
          this.state.firstTrack = false;
        } else {
          this.displayer.client.updatemusicsystem(this);
        }
      })
      // eslint-disable-next-line consistent-return
      .on('finish', () => {
        this.player.playing = false;
        if (this.player.filterUpdate) {
          this.player.filterUpdate = false;
          return this.player.playTrack(this.queue.current, {
            seek: this.player.streamTime,
            filters: this.player._filters,
          });
        }
        this.player.streamTime = 0;
        if (this.player.trackLoop && !this.player.forceskip) {
          return this.player.playTrack(this.queue.current);
        }
        this.player.forceskip = false;
        this.queue.previous = this.queue.current;
        this.queue.current = null;
        if (this.queue.length === 0) {
          this.displayer.client.deletemusicsystem(this);
          if (this.queue.backupQueue.length && this.player.queueLoop) {
            this.queue.push(...this.queue.backupQueue);
            this.queue.current = this.queue.shift();
            return this.player.playTrack(this.queue.current);
          }
          if (this.timer.Hastimer) this.timer.end();
          this.timer.start(() => {
            this.emitEv('disconnect');
            disconnect(this.connection);
            this.displayer.deleteManager(this.guild.id);
          });
          return this.emitEv('queueFinish', this.queue);
        }
        this.emitEv('trackFinish', this.queue.current);
        this.queue.current = this.queue.shift();
        if (this.queue.shuffleQueue.length) {
          const index = this.queue.shuffleQueue.indexOf(this.queue.current);
          if (index !== -1) this.queue.shuffleQueue.splice(index, 1);
        }
        this.player.playTrack(this.queue.current);
      })
      .on('voiceChannelChange', (id) => {
        this.guild.channels
          .fetch(id)
          // eslint-disable-next-line no-return-assign
          .then((channel) => {
            this.voiceChannel = channel;
          })
          .catch({});
      });
  }

  addTrackArray(arr) {
    if (this.timer.Hastimer) this.timer.end();
    if (arr.length === 1) {
      this.queue.push(arr[0]);
      if (this.queue.current) {
        this.emitEv('trackAdd', arr[0]);
      } else {
        this.state.firstTrack = true;
      }
    } else if (arr.length > 1) {
      this.queue.push(...arr);
      if (this.queue.current) {
        // this.displayer.client.updatemusicsystem(this);
        this.emitEv('tracksAdd', arr);
      } else {
        this.state.firstTrack = true;
      }
    }
    if (!this.queue.current) {
      this.queue.current = this.queue.shift();
      this.player.playTrack(this.queue.current);
    }
  }

  addTrackResolver(resolver) {
    if (resolver instanceof Array) return this.addTrackArray(resolver);
    if (this.timer.Hastimer) this.timer.end();
    switch (resolver.resulttype) {
      case ResultType.YOUTUBE_VIDEO:
      case ResultType.BILIBILI_VIDEO:
        this.queue.push(resolver.tracks[0]);
        if (this.queue.current) {
          this.emitEv('trackAdd', resolver.tracks[0]);
        } else {
          this.state.firstTrack = true;
        }
        break;
      case ResultType.YOUTUBE_PLAYLIST:
        console.log(resolver);
        this.queue.push(...resolver.tracks);
        if (this.queue.current) {
          // this.displayer.client.updatemusicsystem(this);
          this.emitEv('playlistAdd', resolver.tracks, resolver.playlist);
        } else {
          this.state.firstTrack = true;
        }
        break;
      default:
        break;
    }
    if (!this.queue.current) {
      this.queue.current = this.queue.shift();
      this.player.playTrack(this.queue.current);
    }
    return true;
  }

  jump(index) {
    const selected = this.queue[index - 1];
    delete this.queue[index - 1];
    this.queue.unshift(selected);
    this.player.forceskip = true;
    this.voice.end();
  }

  shuffle() {
    if (this.queue.shuffleQueue.length > 0) {
      this.queue.clear();
      const tracks = this.queue.shuffleQueue;
      // now add every old song again
      tracks.forEach((e) => {
        this.queue.push(e);
      });
      this.queue.shuffleQueue = [];
      this.queue.isShuffle = false;
    } else {
      this.queue.shuffleQueue = [];
      this.queue.shuffleQueue = this.queue.map((track) => track);
      this.queue.shuffle();
      this.queue.isShuffle = true;
    }
  }

  leave() {
    if (this.timer.Hastimer) this.timer.end();
    disconnect(this.connection);
    this.displayer.deleteManager(this.guild.id);
  }
};
