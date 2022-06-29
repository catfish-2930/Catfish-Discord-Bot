exports.SourceType = Object.freeze({
  YOUTUBE: 'YOUTUBE',
  BILIBILI: 'bilibili',
  UNKNOWN: 'unknown',
});

exports.ResultType = Object.freeze({
  YOUTUBE_VIDEO: 'youtube_video',
  YOUTUBE_PLAYLIST: 'youtube_playlist',
  BILIBILI_VIDEO: 'bilibili_video',
  UNKNOWN: 'unknown',
});

exports.QueryType = Object.freeze({
  YOUTUBE_SEARCH: 'youtube_search',
  YOUTUBE_VIDEO: 'youtube_video',
  YOUTUBE_PLAYLIST: 'youtube_playlist',
  BILIBILI_VIDEO: 'bilibili_video',
});

exports.LoopType = Object.freeze({
  SONG: 'trackLoop',
  QUEUE: 'queueloop',
  OFF: 'offloop',
});
