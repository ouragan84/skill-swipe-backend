const express = require('express');

const rootController = express();

git_commit_hash = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();

// Define the home page route
rootController.get('/', function(req, res) {
  res.send('Hello From Skill Swipe Backend API!');
});

// Define the about route
rootController.get('/about', function(req, res) {
  res.send('About us');
});

// To get commit hash
rootController.get('/git-commit', function(req, res) {
  res.send(git_commit_hash);
});

module.exports = rootController;