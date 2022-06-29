module.exports = (client) => {
  let config;
  try {
    /* eslint-disable global-require */
    /* eslint-disable import/extensions  */
    config = require('../config/botconfig.json');
  } catch (err) {
    config = {
      prefix: '!',
      language: 'zh_cn',
    };
  }
  // eslint-disable-next-line no-param-reassign
  client.config = config;
};
