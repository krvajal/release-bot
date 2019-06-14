# Release Bot 🤖

Automates the creation of a release branch based on a GitHub pipeline

## Workflow

This code consist on a transaction script that executes the following steps.

- Creates a release branch based on master
- Gets the list of PR to `master` that are in the given pipeline
- Merges all the PRs into the release branch
- Creates a PR from the release branch into master
- Sets the description of such PR to contain all the descriptions of the given PRs

## Config

This tool uses both GitHub and ZenHub API, so you need to obtain an access token for both of them,
and make then available as environment variables (`ZENHUB_TOKEN` and `GITHUB_TOKEN`).

It also needs a config file called `config.yml`.
You can look at the example provided to have an idea of how it works.

## Running the script

To run the script execute in the command line

```
$ node bot.js :release_branch_name
```

where `:release_branch_name` is a placeholder for the name of the release branch (something like `release/v1.0.0` for example).
and you will get an output similar to this one

```
✔ Getting release pipeline
✔ Getting issues in release pipeline
✔ Filtering down the PRs
✔ Creating the release branch
✔ Creating the release branch
✔ Changing PR #63 base to release branch
✔ Creating PR from the release branch into master
ℹ https://github.com/krvajal/release-bot/pull/64
✔ DONE!
```

## Get GitHub certificate

```
openssl s_client -showcerts -connect api.github.com:443 < /dev/null | openssl x509 -outform PEM > github.crt
```
