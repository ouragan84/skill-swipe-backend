'use strict';

let jsonData = require('./skills.json');

const readTextFile = () => {
  try {
    console.log("reading from file")
    return jsonData.skills;
  } catch (error) {
    console.error('Error reading the file:', error);
  }
}

// Call the function with the URL of your fixed file
const tags = readTextFile();

module.exports = {tags};