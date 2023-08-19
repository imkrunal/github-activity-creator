const { Octokit } = require('octokit')
const { faker } = require('@faker-js/faker')
const { cronLog } = require('./utils')
const { db } = require('./db')
const { config } = require('./config')

const createCommit = async (job) => {
  try {
    const octokit = new Octokit({
      auth: config.authToken,
    })

    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated()

    const fileInfo = await octokit.rest.repos.getContent({
      owner: login,
      repo: config.repo,
      path: config.file,
    })

    const { sha } = fileInfo.data

    const commit = await octokit.rest.repos.createOrUpdateFileContents({
      owner: login,
      repo: config.repo,
      path: config.file,
      message: faker.lorem.words({ max: 6, min: 3 }),
      content: Buffer.from(
        faker.lorem.paragraphs({ min: 2, max: 10 }),
      ).toString('base64'),
      sha,
    })

    cronLog(
      `Created commit for job: ${job.id}. Commit SHA: ${commit.data.commit.sha}`,
    )

    db.all(
      'UPDATE jobs SET completed = 1 WHERE id = ?',
      [job.id],
      function (err) {
        if (err) throw err
      },
    )
  } catch (e) {
    cronLog(`Error: ${JSON.stringify(e)}`)
  }
}

const createIssue = async (job) => {
  try {
    const octokit = new Octokit({
      auth: config.authToken,
    })

    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated()

    const issue = await octokit.rest.issues.create({
      owner: login,
      repo: config.repo,
      title: faker.lorem.words({ min: 5, max: 15 }),
      body: faker.lorem.paragraphs({ min: 5, max: 15 }),
    })

    cronLog(`Created issue for job: ${job.id}. Issue ID: ${issue.data.id}`)

    const closeIssue = await octokit.rest.issues.update({
      owner: login,
      repo: config.repo,
      issue_number: issue.data.number,
      state: 'closed',
    })

    cronLog(`Closed issue for job: ${job.id}. Issue ID: ${closeIssue.data.id}`)

    db.all(
      'UPDATE jobs SET completed = 1 WHERE id = ?',
      [job.id],
      function (err) {
        if (err) throw err
      },
    )
  } catch (e) {
    cronLog(`Error: ${JSON.stringify(e)}`)
  }
}

const createPullRequest = async (job) => {
  try {
    const octokit = new Octokit({
      auth: config.authToken,
    })

    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated()

    const baseBranch = await octokit.rest.git.getRef({
      owner: login,
      repo: config.repo,
      ref: config.baseBranchRef,
    })

    const baseCommitSha = baseBranch.data.object.sha

    const newBranchName = faker.lorem.word()

    await octokit.rest.git.createRef({
      owner: login,
      repo: config.repo,
      sha: baseCommitSha,
      ref: `refs/heads/${newBranchName}`,
    })

    const fileInfo = await octokit.rest.repos.getContent({
      owner: login,
      repo: config.repo,
      path: config.file,
      ref: newBranchName,
    })

    const { sha } = fileInfo.data

    const commit = await octokit.rest.repos.createOrUpdateFileContents({
      owner: login,
      repo: config.repo,
      branch: newBranchName,
      path: config.file,
      message: faker.lorem.words({ max: 6, min: 3 }),
      content: Buffer.from(
        faker.lorem.paragraphs({ min: 2, max: 10 }),
      ).toString('base64'),
      sha,
    })

    cronLog(
      `Created commit for job: ${job.id}. Commit SHA: ${commit.data.commit.sha}`,
    )

    const pullRequest = await octokit.rest.pulls.create({
      owner: login,
      repo: config.repo,
      base: config.baseBranch,
      head: newBranchName,
      title: faker.lorem.words({ max: 6, min: 3 }),
      body: faker.lorem.paragraphs({ min: 2, max: 5 }),
    })

    cronLog(
      `Created pull request for job: ${job.id}. Pull Request ID: ${pullRequest.data.id}`,
    )

    const merge = await octokit.rest.pulls.merge({
      owner: login,
      repo: config.repo,
      pull_number: pullRequest.data.number,
    })

    cronLog(
      `Merge pull request for job: ${job.id}. Merge Request SHA: ${merge.data.sha}`,
    )

    db.all(
      'UPDATE jobs SET completed = 1 WHERE id = ?',
      [job.id],
      function (err) {
        if (err) throw err
      },
    )
  } catch (e) {
    cronLog(`Error: ${JSON.stringify(e)}`)
  }
}

module.exports = { createCommit, createIssue, createPullRequest }
