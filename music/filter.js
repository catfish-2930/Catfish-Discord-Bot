// eslint-disable-next-line import/extensions
const config = require('../config/filterConfig.json');

const _filterList = config.filter;
const _normalizer = config.normalizer;

exports.filterList = () => _filterList;

exports.normalizerList = () => _normalizer;

exports.filterLength = () => _filterList.length;

exports.exist = (key) => Object.prototype.hasOwnProperty.call(_filterList, key);

exports.getKey = (num) => {
  const keys = Object.keys(_filterList);
  return keys[num - 1];
};

exports.createDefaultFilters = () => {
  const filters = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const [k] of Object.entries(_filterList)) {
    filters.push({ name: k, value: false });
  }
  return filters;
};

exports.CreateFilterString = (filters) => {
  if (!Array.isArray(filters)) return [];
  const result = [];
  // eslint-disable-next-line no-restricted-syntax
  filters.forEach((v) => {
    if (v.value) result.push(_filterList[v.name]);
  });
  if (result.length > 0) {
    if (filters.bassboost) {
      result.unshift(_normalizer.normalizer2);
    } else {
      result.unshift(_normalizer.normalizer);
    }
  } else {
    return [];
  }
  // console.log([result.length ? '-af' : {}, result.join(',')]);
  return [result.length ? '-af' : {}, result.join(',')];
};
