const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require('@discordjs/voice');

exports.join = async (channel, options = { deaf: true, maxTime: 20000 }) => {
  const conn = joinVoiceChannel({
    guildId: channel.guild.id,
    channelId: channel.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: Boolean(options.deaf),
  });
  return conn;
};

exports.enterReady = async (conn, options = { maxTime: 20000 }) => {
  try {
    // eslint-disable-next-line no-param-reassign
    conn = await entersState(
      conn,
      VoiceConnectionStatus.Ready,
      options?.maxTime
    );
    return conn;
  } catch (err) {
    conn.destroy();
    throw err;
  }
};

exports.disconnect = (conn) => {
  try {
    conn.destroy();
    // eslint-disable-next-line no-empty
  } catch {}
};
