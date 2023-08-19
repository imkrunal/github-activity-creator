const config = {
  repo: process.env.GITHUB_REPO,
  authToken: process.env.GITHUB_ACCESS_TOKEN,
  file: 'README.md',
  baseBranch: 'main',
  baseBranchRef: 'heads/main',
  maxCommits: 10,
  maxIssues: 2,
  maxPullRequests: 5,
}

module.exports = { config }
