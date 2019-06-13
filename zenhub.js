const axios = require("axios");

function ZenhubAPI() {
  this.httpClient = axios.create({
    baseURL: "https://api.zenhub.io/",
    headers: {
      "X-Authentication-Token": process.env.ZENHUB_TOKEN
    }
  });
}

ZenhubAPI.prototype.getBoard = function getBoard(repoId) {
  return this.httpClient
    .get(`/p1/repositories/${repoId}/board`)
    .then(res => res.data);
};

module.exports = ZenhubAPI;
