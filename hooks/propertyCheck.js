const jobTags = require('../models/positionTags');

const checkPropertyExists = (property, propertyName, expectedType, action="create user") => {
    if(typeof(property) != expectedType)
        throw new Error(`Could not ${action}, ${propertyName} was not specified`);
}

const checkInRange = (range, rangeName, lower, upper, action="create user") => {
    checkPropertyExists(range, "range " + rangeName, "object", action)
    if(range.length != 2) //TODO: add action to error message
        throw new Error(`Could not create user, range ${rangeName} did not have 2 values as expected.`);
    if(range[0] < lower)
        throw new Error("Could not create user, lower bound of range " + rangeName + " was too low. Lower bound is " + lower + " at minimum");
    if(range[1] < lower)
        throw new Error("Could not create user, upper bound of range " + rangeName + " was too low. Upper bound is " + lower + " at minimum");
    if(range[0] > upper)
        throw new Error("Could not create user, lower bound of range " + rangeName + " was too high. Lower bound is " + upper + " at most");
    if(range[1] > upper)
        throw new Error("Could not create user, upper bound of range " + rangeName + " was too high. Upper bound is " + upper + " at most");
}

const checkTags = (tags, tagsName) => {
    checkPropertyExists(tags, tagsName, "object", `add ${tagsName}`);
    tags.forEach(tag => {
        if(!jobTags.includes(tag))
            throw new Error("Skill tag \'" + tag + "\' is not valid");
    });
}

module.exports = {checkPropertyExists, checkInRange, checkTags};