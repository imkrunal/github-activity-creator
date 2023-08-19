const { times, random } = require('lodash')
const cron = require('node-cron')
const { getRandomDateTime, cronLog } = require('./utils')
const { createCommit, createIssue, createPullRequest } = require('./actions')
const { db } = require('./db')
const { config } = require('./config')
require('dotenv').config()

/*
 * A cron function that runs every day once and generates the jobs for
 * creating the commits, pull requests and issues.
 *
 * Cron Expression: 0 0 * * *
 */

const generateJobs = async () => {
  try {
    // Create job for commits
    const noOfCommits = random(1, config.maxCommits)
    cronLog(`Total commits to create: ${noOfCommits}`)

    const commitTimings = times(noOfCommits, getRandomDateTime)
    cronLog(`Time to commit: ${JSON.stringify(commitTimings)}`)

    for (let i = 0; i < noOfCommits; i++) {
      const time = commitTimings[i]
      db.all(
        'INSERT INTO jobs (type, time) VALUES (?, ?)',
        ['COMMIT', time],
        function (err) {
          if (err) throw err
        },
      )
    }

    // Create job for issues
    const noOfIssues = random(1, config.maxIssues)
    cronLog(`Total issues to create: ${noOfIssues}`)

    const issuesTimings = times(noOfIssues, getRandomDateTime)
    cronLog(`Time to create issues: ${JSON.stringify(issuesTimings)}`)

    for (let i = 0; i < noOfIssues; i++) {
      const time = issuesTimings[i]
      db.all(
        'INSERT INTO jobs (type, time) VALUES (?, ?)',
        ['CREATE_ISSUE', time],
        function (err) {
          if (err) throw err
        },
      )
    }

    // Create job for pull requests
    const noOfPullRequests = random(1, config.maxPullRequests)
    cronLog(`Total pull requests to create: ${noOfPullRequests}`)

    const pullRequestsTimings = times(noOfPullRequests, getRandomDateTime)
    cronLog(
      `Time to create pull requests: ${JSON.stringify(pullRequestsTimings)}`,
    )

    for (let i = 0; i < noOfPullRequests; i++) {
      const time = pullRequestsTimings[i]
      db.all(
        'INSERT INTO jobs (type, time) VALUES (?, ?)',
        ['CREATE_PULL_REQUEST', time],
        function (err) {
          if (err) throw err
        },
      )
    }
  } catch (e) {
    cronLog(`Error: ${JSON.stringify(e)}`)
  }
}

// cron.schedule('*/10 * * * * *', generateJobs)
cron.schedule('0 0 * * *', generateJobs)

/*
 * A cron function that runs every minute to check if it
 * needs to process a job
 *
 * Cron Expression: * * * * *
 */

const processJob = async () => {
  const currentTime = new Date().toISOString()
  db.all(
    `SELECT * FROM jobs WHERE time < ? AND completed = 0`,
    [currentTime],
    function (err, rows) {
      if (err) {
        throw err
      }

      for (let i = 0; i < rows.length; i++) {
        const job = rows[i]
        cronLog(`Running cron for ${job.type}`)
        if (job.type === 'COMMIT') createCommit(job)
        if (job.type === 'CREATE_ISSUE') createIssue(job)
        if (job.type === 'CREATE_PULL_REQUEST') createPullRequest(job)
        // break so id does not try to 2 requests back to back and cause 409
        break
      }
    },
  )
}

cron.schedule('* * * * *', processJob)
