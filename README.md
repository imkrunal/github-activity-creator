<h1 align="center">GitHub Activity Creator</h1>
<p align="center">A simple nodejs script that creates commits, pull requests and issue to generate activity on GitHub account.</p>

### How to use

1. Create a new Repo on GitHub with README.md file

2. Create an env file with below variables

```
GITHUB_ACCESS_TOKEN=
GITHUB_REPO=
```

3. (optional) configure `src/config.js` for max no of commits, issues and pull requests per day.

4. Start the script

```
yarn start

or

npm run start
```
