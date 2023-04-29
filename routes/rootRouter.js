const express = require('express');
const path = require('path');
const {getImage} = require('../hooks/imageHandler');
const {sendMail} = require('../hooks/emailConfig');

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

router.get('/terms-of-use', (req, res) => res.redirect('/static/terms-of-use.html'));

router.get('/privacy-policy', (req, res) => res.redirect('/static/privacy-policy.html'));

router.get('/get/image-url/:title', async (req, res) => {
  const url = await getImage(req.params.title);
  res.status(200).send({'status':'success', 'message':'found image url successfully', 'url': url})
});

router.post('/ping', (req, res) => {
  console.log('got ping:');
  console.log(req.body);
  res.status(200).send({'status':'ok'})
})

router.post('/send-email', (req, res) => {
  sendMail(req.body.to, req.body.subject, req.body.text, req.body.html);
  return res.status(200).send('Success');
})


module.exports = router;
