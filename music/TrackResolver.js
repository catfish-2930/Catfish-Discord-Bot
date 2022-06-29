const ytdl = require('ytdl-core');
// const playdl = require('play-dl');
const ytsr = require('ytsr');
const ytpl = require('ytpl');
const { ytValidate } = require('../util/urlUtils.js');
const { Bgetinfo, Bvalidate } = require('./extractor/bilibili/index.js');
const { ResultType, QueryType, SourceType } = require('./types.js');

function converttime(str) {
  return str
    .split(':')
    .reverse()
    .reduce((prev, curr, i) => prev + curr * 60 ** i, 0);
}

module.exports = class TrackResolver {
  static async search(
    query,
    options = {
      RequestBy: {
        name: '',
        avatarUrl: '',
      },
    }
  ) {
    if (!query) throw new Error('No valid query');
    // eslint-disable-next-line no-param-reassign
    query = this.ValidateType(query);
    // eslint-disable-next-line prefer-const
    let result = {
      tracks: [],
      playlist: {},
      RequestBy: options.RequestBy,
      resulttype: ResultType.UNKNOWN,
    };
    switch (query.querytype) {
      case QueryType.YOUTUBE_VIDEO:
        {
          const info = await ytdl.getInfo(query.url).catch((err) => err);
          if (info instanceof Error) return result;
          if (!info) return result;
          const track = {
            title: info.videoDetails.title,
            author: {
              name: info.videoDetails.author.name,
              thumbnail: info.videoDetails.author.thumbnails?.at(-1),
            },
            duration: parseInt(info.videoDetails.lengthSeconds, 10),
            thumbnail: info.videoDetails.thumbnails?.at(-1),
            url: info.videoDetails.video_url,
            extra: {
              isLive: info.videoDetails.isLiveContent,
              isAge_restricted: info.videoDetails.age_restricted,
              isPrivate: info.videoDetails.isPrivate,
            },
            RequestBy: options.RequestBy,
            source: SourceType.YOUTUBE,
          };
          result.tracks.push(track);
          result.resulttype = ResultType.YOUTUBE_VIDEO;
        }
        break;
      case QueryType.YOUTUBE_SEARCH:
        {
          const searchResult = await ytsr(query.url, { limit: 8 }).catch({});
          const tracks = searchResult.items.filter((i) => i.type === 'video');
          if (!tracks.length) return result;
          const info = await ytdl.getInfo(tracks[0].url).catch((err) => err);
          if (info instanceof Error) return info;
          const track = {
            title: info.videoDetails.title,
            author: {
              name: info.videoDetails.author.name,
              thumbnail: info.videoDetails.author.thumbnails?.at(-1),
            },
            duration: parseInt(info.videoDetails.lengthSeconds, 10),
            thumbnail: info.videoDetails.thumbnails?.at(-1),
            url: info.videoDetails.video_url,
            extra: {
              isLive: info.videoDetails.isLiveContent,
              isAge_restricted: info.videoDetails.age_restricted,
              isPrivate: info.videoDetails.isPrivate,
            },
            RequestBy: options.RequestBy,
            source: SourceType.YOUTUBE,
          };
          result.tracks.push(track);
          result.resulttype = ResultType.YOUTUBE_VIDEO;
        }
        break;
      case QueryType.YOUTUBE_PLAYLIST:
        {
          const playlist = await ytpl(query.url).catch((err) => err);
          if (playlist instanceof Error) return playlist;
          // eslint-disable-next-line no-restricted-syntax
          for (const item of playlist.items) {
            const track = {
              title: item.title,
              author: {
                name: item.author.name,
                thumbnail: null,
              },
              duration: item.durationSec ?? 0,
              thumbnail: item.bestThumbnail,
              url: item.url,
              extra: {
                isLive: item.duration === null || item.duration === 0,
              },
              RequestBy: options.RequestBy,
              source: SourceType.YOUTUBE,
            };
            result.tracks.push(track);
          }
          result.playlist = {
            title: playlist.title,
            url: playlist.url,
            thumbnail: playlist.bestThumbnail,
            author: playlist.author,
          };
          result.resulttype = ResultType.YOUTUBE_PLAYLIST;
        }
        break;
      case QueryType.BILIBILI_VIDEO:
        {
          const info = await Bgetinfo(query.url).catch((err) => err);
          if (info instanceof Error) return result;
          info.RequestBy = options.RequestBy;
          const track = info;
          result.tracks.push(track);
          result.resulttype = ResultType.BILIBILI_VIDEO;
        }
        break;
      default:
        break;
    }
    return result;
  }

  static async searchTracks(
    query,
    options = {
      RequestBy: {
        name: '',
        avatarUrl: '',
      },
    }
  ) {
    const result = {
      tracks: [],
      RequestBy: options.RequestBy,
      resulttype: ResultType.YOUTUBE_VIDEO,
    };
    const searchResult = await ytsr(query, { limit: 10 }).catch({});
    let tracks = searchResult.items.filter((i) => i.type === 'video');
    if (!tracks.length) return result;
    tracks = tracks.map((info) => ({
      title: info.title,
      author: {
        name: info.author.name,
        thumbnail: info.author.bestAvatar,
      },
      duration: converttime(info.duration),
      thumbnail: info.bestThumbnail,
      url: info.url,
      extra: {
        isLive: info.isLive,
      },
      RequestBy: options.RequestBy,
      source: SourceType.YOUTUBE,
    }));
    result.tracks = tracks;
    return result;
  }

  static ValidateType(url) {
    const type = ytValidate(url);
    // const unknown = type === false || type === 'search';
    const isBilibili = Bvalidate(url);
    // eslint-disable-next-line prefer-const
    let query = {
      url: url,
      querytype: QueryType.YOUTUBE_SEARCH,
    };
    if (type === 'video' && url.startsWith('https')) {
      query.url = url.replace(/(\?|&)list=.+/, '');
      query.querytype = QueryType.YOUTUBE_VIDEO;
    } else if (type === 'playlist') {
      query.querytype = QueryType.YOUTUBE_PLAYLIST;
    } else if (isBilibili) {
      query.querytype = QueryType.BILIBILI_VIDEO;
    }
    return query;
  }
};
