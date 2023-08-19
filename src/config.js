const config = {
  repo: 'activity-displayer',
  file: 'README.md',
  baseBranch: 'main',
  baseBranchRef: 'heads/main',
  authToken: process.env.GITHUB_ACCESS_TOKEN,
}

module.exports = { config }
