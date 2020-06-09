const { readFile: rf } = require('fs');
const { promisify } = require('util');

const readFile = async (path) => {
  const buff = await promisify(rf)(path);
  return String(buff);
};

module.exports = { readFile }