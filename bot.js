require("dotenv").config();
const _ = require("lodash");
const ora = require("ora");
const ZenhubAPI = require("./zenhub");
const GitHubAPI = require("./github");
const { isPR, sleep, promiseSerial, getConfig } = require("./utils");

const releaseBranch = process.argv[2];

function run() {
  const progress = ora();

  const { repo, owner, board_id, to_deploy_pipeline } = getConfig();

  const zenhubClient = new ZenhubAPI();
  const githubClient = new GitHubAPI({ owner, repo });

  zenhubClient
    .getBoard(board_id)
    .then(board => {
      progress.start("Getting board data");
      return board.pipelines;
    })
    .then(pipelines => {
      progress.start("Getting release pipeline");
      return pipelines.find(pipeline => pipeline.name == to_deploy_pipeline);
    })
    .then(releasePipeline => {
      progress.succeed();
      progress.start("Getting issues in release pipeline");
      return Promise.all(
        releasePipeline.issues.map(zenhubIssue =>
          githubClient.getIssue(zenhubIssue.issue_number)
        )
      );
    })
    .then(issues => {
      progress.succeed();
      progress.start("Filtering down the PRs");
      const [pullRequests, normalIssues] = _.partition(issues, isPR);
      return pullRequests;
    })
    .then(async pullRequests => {
      progress.succeed();
      progress.start("Creating the release branch");
      await githubClient.createBranch("master", releaseBranch);
      progress.succeed();
      const processPull = async pull => {
        progress.succeed();
        progress.start(`Changing PR #${pull.number} base to release branch`);
        await githubClient.updatePullBase(pull.number, releaseBranch);
        //  merge the PR into the release branch
        await sleep(2000);
        progress.succeed();
        progress.start(`Merging PR #${pull.number} into release branch`);
        return await githubClient.mergePull(pull.number);
      };

      const operations = promiseSerial(
        pullRequests.map(pull => () => processPull(pull))
      );

      await operations;
      return { pullRequests, releaseBranch };
    })
    .then(({ pullRequests, releaseBranch }) => {
      const releaseBody = pullRequests
        .map(pull => {
          const { url } = pull.pull_request;
          let bodyFragment = url;
          bodyFragment += "\n";
          bodyFragment += pull.body;
          return bodyFragment;
        })
        .join("\n\n");

      progress.start("Creating PR from the release branch into master");
      return githubClient.createPull(releaseBranch, "master", {
        title: releaseBranch,
        body: releaseBody
      });
    })
    .then(releasePullRequest => {
      progress.succeed();
      progress.info(releasePullRequest.html_url);
      progress.succeed("DONE!");
    })
    .catch(err => {
      progress.fail(err.response.data.message);
    });
}

run();
