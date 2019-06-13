const axios =  require('axios')
const fs = require('fs')
const https  = require('https')
const _ = require('lodash')
const ZENHUB_TOKEN =  "223ae75017614cc641a7f65a5012b2bb2d148e4602dfe17372519bb2cde08d2e852469c4c996783f"
const BOARD_ID = "47976963"
const GITHUB_TOKEN = "208aced639bc149804f5bb754ea186b347b46a74"
const TO_RELEASE_PIPELINE_NAME = "Passed QA"


const owner = "krvajal"
const repo = "release_bot"


function ZenhubAPI () {
  this.httpClient =  axios.create({
    baseURL: 'https://api.zenhub.io/',
    headers: {
      'X-Authentication-Token': ZENHUB_TOKEN
    }
  })
}

ZenhubAPI.prototype.getBoard = function getBoard(repoId){
   return this.httpClient.get(`/p1/repositories/${repoId}/board`).then(res => res.data)
}


function GitHubAPI ({owner, repo}) {
  this.owner = owner;
  this.repo = repo;
  this.httpClient =  axios.create({
    baseURL: "https://api.github.com:443/",
    headers: {
        "Accept":  "application/vnd.github.v3+json",
         "Authorization": `token ${GITHUB_TOKEN}`
    },
     httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      //cert: fs.readFileSync("./github.crt"),
     // secureProtocol: 'SSLv1_method'
   })
  })
}

GitHubAPI.prototype.getIssue = function getIssue( issueNumber){
  return this.httpClient.get(`/repos/${this.owner}/${this.repo}/issues/${issueNumber}`).then(res => res.data)
}

GitHubAPI.prototype.createBranch = function createBranch(base, branchName) {
  return  this.httpClient.get(`/repos/${this.owner}/${this.repo}/git/refs/heads/${base}`)
    .then(res => res.data)
    .then(baseBranchDescriptor => {
      const {sha}  = baseBranchDescriptor.object;

      return this.httpClient.post(`/repos/${this.owner}/${this.repo}/git/refs`, {
           ref: `refs/heads/${branchName}`,
           sha
        })

    }).then(res => res.data)

}

const zenhubClient = new ZenhubAPI()
const githubClient = new GitHubAPI({owner, repo})

/*
zenhubClient.getBoard(BOARD_ID).then(board => {
  return board.pipelines;

}).then(pipelines => {

  return pipelines.find(pipeline => pipeline.name == TO_RELEASE_PIPELINE_NAME)
}).then(releasePipeline => {
  console.log(releasePipeline.issues)
  return Promise.all(releasePipeline.issues.map(zenhubIssue => githubClient.getIssue("sweepbright","webapp", zenhubIssue.issue_number)))
}).then( issues => {
  const [pullRequests, normalIssues]  = _.partition(issues, isPR)
  console.log({pullRequests})

  return pullRequests;
}).then( () => {
    return githubClient.createBranch("master", "release/v222")

}).then(result => {
  console.log(result)
})

*/
githubClient.createBranch("master", "test_branch").then(res => {
  console.log(res)
})


/// helpers

function isPR(issue){
  return issue.pull_request && issue.pull_request.url
}
