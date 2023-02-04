const express = require('express');

const rootController = express();

// Define the home page route
rootController.get('/', function(req, res) {
  res.send('Hello From Skill Swipe Backend API!');
});

// Define the about route
rootController.get('/about', function(req, res) {
  res.send('About us');
});

module.exports = rootController;