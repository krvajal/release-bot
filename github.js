const axios = require("axios");
const https = require("https");

function GitHubAPI({ owner, repo }) {
  this.owner = owner;
  this.repo = repo;
  this.httpClient = axios.create({
    baseURL: "https://api.github.com/",
    headers: {
      Accept: "application/vnd.github.v3+json",
      Authorization: `token ${process.env.GITHUB_TOKEN}`
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false
    })
  });
}

GitHubAPI.prototype.getIssue = function getIssue(issueNumber) {
  return this.httpClient
    .get(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}`)
    .then(res => res.data);
};

GitHubAPI.prototype.createBranch = function createBranch(base, branchName) {
  return this.httpClient
    .get(`/repos/${this.owner}/${this.repo}/git/refs/heads/${base}`)
    .then(res => res.data)
    .then(baseBranchDescriptor => {
      const { sha } = baseBranchDescriptor.object;

      return this.httpClient.post(
        `/repos/${this.owner}/${this.repo}/git/refs`,
        {
          ref: `refs/heads/${branchName}`,
          sha
        }
      );
    })
    .then(res => res.data);
};

GitHubAPI.prototype.updatePullBase = function updatePullBase(
  pullNumber,
  newBase
) {
  return this.httpClient
    .patch(`/repos/${this.owner}/${this.repo}/pulls/${pullNumber}`, {
      base: newBase
    })
    .then(res => res.data);
};

GitHubAPI.prototype.mergePull = function mergePull(pullNumber) {
  return this.httpClient.put(
    `/repos/${this.owner}/${this.repo}/pulls/${pullNumber}/merge`
  );
};

GitHubAPI.prototype.createPull = function createPull(head, base, options) {
  return this.httpClient
    .post(`/repos/${this.owner}/${this.repo}/pulls`, {
      head,
      base,
      ...options
    })
    .then(res => res.data);
};

module.exports = GitHubAPI;
