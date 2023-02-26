const express = require('express');
var path = require('path');

const router = express.Router();

const git_commit_hash = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString().trim();

// Define the home page route
router.get('/', (req, res) => { res.send('Hello From Skill Swipe Backend API!'); });
  
// Define the about route
router.get('/about', (req, res) => { res.send('About us'); });

// To get commit hash
router.get('/git-commit', (req, res) => { res.send(git_commit_hash); });

router.get('/terms-of-use', (req, res) => { res.sendFile(path.join(__dirname, '../public/terms-of-use.html'))});

router.get('/privacy-policy', (req, res) => { res.sendFile(path.join(__dirname, '../public/privacy-policy.html'))});


module.exports = router;