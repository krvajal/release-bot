require("dotenv").config();
const _ = require("lodash");

const ZenhubAPI = require("./zenhub");
const GitHubAPI = require("./github");

const ZENHUB_BOARD_ID = "191766420";
const TO_RELEASE_PIPELINE_NAME = "Review/QA";

const owner = "krvajal";
const repo = "release-bot";

const zenhubClient = new ZenhubAPI();
const githubClient = new GitHubAPI({ owner, repo });

zenhubClient
  .getBoard(ZENHUB_BOARD_ID)
  .then(board => {
    console.log("Getting board data");
    return board.pipelines;
  })
  .then(pipelines => {
    console.log("Getting release pipeline");
    return pipelines.find(
      pipeline => pipeline.name == TO_RELEASE_PIPELINE_NAME
    );
  })
  .then(releasePipeline => {
    console.log("Getting issues in release pipeline");
    console.log(releasePipeline.issues);
    return Promise.all(
      releasePipeline.issues.map(zenhubIssue =>
        githubClient.getIssue(zenhubIssue.issue_number)
      )
    );
  })
  .then(issues => {
    const [pullRequests, normalIssues] = _.partition(issues, isPR);

    console.log("Filtering down the PRs");
    console.log({ pullRequests });

    return pullRequests;
  })
  .then(async pullRequests => {
    const releaseBranch = "release/v5";
    console.log("Creating the release branch");
    await githubClient.createBranch("master", releaseBranch);
    const operations = pullRequests.map(async pull => {
      await githubClient.updatePullBase(pull.number, releaseBranch);
      //  merge the PR into the release branch

      //
      await githubClient.mergePull(pull.number);
    });

    return Promise.all(operations);
  })
  .then(result => {
    console.log(result);
  })
  .catch(err => {
    console.log(err);
  });

/// helpers

function isPR(issue) {
  return issue.pull_request && issue.pull_request.url;
}
