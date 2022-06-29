const EventEmittter = require('events');
const {
  createAudioPlayer,
  VoiceConnectionStatus,
  VoiceConnectionDisconnectReason,
  entersState,
  AudioPlayerStatus,
} = require('@discordjs/voice');
// eslint-disable-next-line import/no-unresolved
const { promisify } = require('node:util');
const { disconnect, enterReady } = require('./VoiceUtil.js');

const wait = promisify(setTimeout);

module.exports = class Voice extends EventEmittter {
  constructor(voiceChannel, connection) {
    super();
    if (!voiceChannel.joinable) throw new Error('Not joinable');
    this.guildId = voiceChannel.guildId;
    this.channel = voiceChannel;
    this.connection = connection;
    this.audioPlayer = createAudioPlayer();
    this.readyLock = false;
    this.audioResourrce = null;
    this.paused = false;
    // eslint-disable-next-line consistent-return
    this.audioPlayer.on('stateChange', (oldState, newState) => {
      if (
        newState.status === AudioPlayerStatus.Idle &&
        oldState.status !== AudioPlayerStatus.Idle
      ) {
        if (!this.paused) {
          this.emit('finish', this.audioResourrce);
          this.audioResourrce = null;
        }
        // prepare to playing next track
      } else if (newState.status === AudioPlayerStatus.Playing) {
        if (!this.paused) return this.emit('start', this.audioResourrce);
        // start playback new track
      }
    });
    this.audioPlayer.on('error', (err) => {
      console.log(err);
      this.emit('error', err);
    });

    this.connection.on('stateChange', async (oldState, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (
          newState.reason === VoiceConnectionDisconnectReason.WebSocketClose &&
          newState.closeCode === 4014
        ) {
          try {
            const state = await entersState(
              this.connection,
              VoiceConnectionStatus.Connecting,
              5000
            );
            this.emit('voiceChannelChange', state.joinConfig.channelId);
          } catch (err) {
            this.connection.destroy();
          }
        } else if (this.connection.rejoinAttempts < 5) {
          await wait((this.connection.rejoinAttempts + 1) * 5000);
          this.connection.rejoin();
        } else {
          this.connection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.stop();
        this.emit('Destroyed');
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting ||
          newState.status === VoiceConnectionStatus.Signalling)
      ) {
        this.readyLock = true;
        try {
          await entersState(
            this.connection,
            VoiceConnectionStatus.Ready,
            20000
          );
        } catch (err) {
          if (this.connection.state.status !== VoiceConnectionStatus.Destroyed)
            disconnect(this.connection);
        } finally {
          this.readyLock = false;
        }
      }
    });
    this.connection.subscribe(this.audioPlayer);
  }

  get status() {
    return this.audioPlayer.state.status;
  }

  async playStream(resource) {
    if (!resource) throw new Error('audio resource unvailable');
    if (resource.ended)
      return this.emit('error', new Error('Cannot play resource of ended'));
    resource.volume.setVolume(0.3);
    this.audioResourrce = resource;
    if (this.connection.state.status !== VoiceConnectionStatus.Ready) {
      try {
        await enterReady(this.connection);
      } catch (err) {
        return this.emit('error', err);
      }
    }
    try {
      this.audioPlayer.play(resource);
    } catch (err) {
      this.emit('error', err);
    }
    return this;
  }

  pause(interpolateSilence = false) {
    const success = this.audioPlayer.pause(interpolateSilence);
    this.paused = success;
    return success;
  }

  resume() {
    const success = this.audioPlayer.unpause();
    this.paused = !success;
    return success;
  }

  stop() {
    this.audioPlayer.stop(true);
  }

  end() {
    this.audioPlayer.stop(true);
  }

  get streamTime() {
    if (!this.audioResourrce) return 0;
    return this.audioResourrce.playbackDuration;
  }
};
