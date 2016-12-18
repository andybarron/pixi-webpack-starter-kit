const path = require('path');
const sc = require('../src/node_modules/shared/config');
const slash = require('slash');
const walk = require('walk');

const REGEX_AUDIO_EXTENSION = /\.(ogg|wav|mp3)$/;

module.exports = (dir) => {
  return new Promise((resolve, _reject) => {
    const walker = walk.walk(dir);
    const map = Object.create(null);
    walker.on('file', function(root, stats, next) {
      if (stats.type === 'file' && REGEX_AUDIO_EXTENSION.test(stats.name)) {
        const filePath = path.join(root, stats.name);
        const relative = slash(path.relative(dir, filePath));
        const key = relative.replace(REGEX_AUDIO_EXTENSION, '');
        const value = path.posix.join(sc.audioPath, relative);
        map[key] = value;
      }
      return next();
    });
    walker.on('end', () => {
      resolve(JSON.stringify(map));
    });
  });
};
