const prism = require('prism-media');

exports.opustream = (stream, options) => {
  // eslint-disable-next-line no-param-reassign
  options = options ?? {};
  let ffmpegArgs = [
    '-analyzeduration',
    '0',
    '-loglevel',
    '0',
    '-f',
    `${typeof options.fmt === 'string' ? options.fmt : 's16le'}`,
    '-ar',
    '48000',
    '-ac',
    '2',
  ];
  if (!Number.isNaN(options.seek)) {
    ffmpegArgs.unshift('-ss', options.seek.toString());
  }
  if (Array.isArray(options.encoderArgs)) {
    ffmpegArgs = ffmpegArgs.concat(options.encoderArgs);
  }
  let transcoder = new prism.FFmpeg({
    args: ffmpegArgs,
  });
  if (typeof stream !== 'string') {
    transcoder = stream.pipe(transcoder);
    stream.on('error', () => {
      console.log('error');
      transcoder.destroy();
    });
  }
  const opus = new prism.opus.Encoder({
    rate: 48000,
    channels: 2,
    frameSize: 960,
  });
  const ouputstream = transcoder.pipe(opus);
  ouputstream.on('close', () => {
    transcoder.destroy();
    opus.destroy();
  });
  return ouputstream;
};
