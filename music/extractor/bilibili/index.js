const { request } = require('../request/index.js');
const { randomuseragent } = require('../Util.js');
const { BStream } = require('./Stream.js');

const getCid = (url, ua) => {
  return new Promise(async (resolve, reject) => {
    const req = {
      headers: {
        bvid: url,
        'user-agent': ua,
      },
      method: 'GET',
    };
    const res = await request(
      'https://api.bilibili.com/x/web-interface/view?',
      req
    ).catch((err) => err);
    if (res instanceof Error) {
      reject(res);
    }
    resolve(JSON.parse(res));
  });
};
//2
const getVideoLink = (data, ua) => {
  return new Promise(async (resolve, reject) => {
    if (!data.data) {
      return new Error('Invalid cid');
    }
    const r = `https://api.bilibili.com/x/player/playurl?bvid=${data.data.bvid}&cid=${data.data.cid}&fnval=16`;
    const req = {
      headers: {
        'user-agent': ua,
      },
    };
    const res = await request(r, req).catch((err) => err);
    if (res instanceof Error) {
      reject(res);
    }
    resolve(JSON.parse(res));
  });
};

exports.Bgetinfo = (url) => {
  return new Promise(async (resolve, reject) => {
    const ua = randomuseragent();
    const id = this.extractID(url);
    if (!id) reject(new Error('No ID found'));
    let info = await getCid(id, ua);
    console.log(info);
    if (info.code !== 0) {
      reject(new Error('video not found'));
    } else {
      info = info?.data;
      console.log(info);
      resolve({
        title: info.title,
        id: info.bvid,
        url: `https://www.bilibili.com/video/${info.bvid}`,
        duration: Number(info.duration),
        thumbnail: {
          url: info.pic,
          width: 0,
          height: 0,
        },
        author: {
          name: info.owner.name,
          thumbnail: info.face,
        },
        supportFilter: true,
        extra: {
          isLive: false,
        },
        source: 'bilibili',
      });
    }
  });
};
exports.Bvalidate = (url) => {
  const regExp = 'https://www.bilibili.com/video/';
  var match = url.toLowerCase().startsWith(regExp);
  if (match) {
    match = url.substring(31, 43);
    if (match.length == 12) return true;
  }
  return false;
};
exports.extractID = (url) => {
  const regExp = 'https://www.bilibili.com/video/';
  var match = url.toLowerCase().startsWith(regExp);
  if (match) {
    match = url.substring(31, 43);
    if (match.length == 12) return match;
  }
  return false;
};
exports.Bstream = async (url, options = {}) => {
  const ua = randomuseragent();
  const id = this.extractID(url);
  if (!id) return new Error('unknown ID');
  let info = await getCid(id, ua).catch((e) => {
    return e;
  });
  if (info.code !== 0) {
    return new Error('video not found');
  }
  const link = await getVideoLink(info, ua);
  let format = link.data.dash;
  format = format.audio[format.audio.length - 1];
  options['ua'] = ua;
  return await createBLStream(format, options);
};

async function createBLStream(format, options) {
  const url = format.baseUrl;
  let header = {
    Referer: 'https://www.bilibili.com/',
    'user-agent': options.ua,
  };
  const headerBox = await getHeader(url, {
    headers: {
      ...header,
      Range: `bytes=${format.SegmentBase.indexRange}`,
    },
  });
  return new BStream(
    format.baseUrl,
    {
      headers: {
        ...header,
        'Accept-Language': 'zh-CN,zh;q=0.9,zh-TW;q=0.8',
        Connection: 'keep-alive',
        Origin: 'https://www.bilibili.com',
        Range: `bytes=0-`,
      },
    },
    headerBox
  );
}

function getHeader(url, header) {
  return new Promise(async (resolve, reject) => {
    const res = await request(url, header, true);
    if (res instanceof Error) reject(res);
    let range = res.headers['content-range'].split('/')[1];
    resolve({
      range: Number(range),
      offset: res.headers['content-range'].split('-')[1].split('/')[0],
    });
  });
}
