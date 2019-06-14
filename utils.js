/// helpers
const fs = require("fs");
const yml = require("yaml");
function isPR(issue) {
  return issue.pull_request && issue.pull_request.url;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const promiseSerial = funcs =>
  funcs.reduce(
    (promise, func) =>
      promise.then(result => func().then(Array.prototype.concat.bind(result))),
    Promise.resolve([])
  );

function getConfig() {
  const config = yml.parse(fs.readFileSync("./config.yml", "utf8"));
  // TODO: validate config
  return { ...config.github, ...config.zenhub };
}

module.exports = {
  isPR,
  sleep,
  promiseSerial,
  getConfig
};
