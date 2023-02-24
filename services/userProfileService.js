const mongoose = require('mongoose');

const UserProfiles = require('../models/userProfile');
const {checkPropertyExists, checkInRange, checkTags} = require('../hooks/propertyCheck');

const createUser = async (req, res) => {
    try{
        const {user} = req.body;

        checkPropertyExists(user, "user", Object);
        checkPropertyExists(user.personalInformation, "personalInformation", Object);
        checkPropertyExists(user.personalInformation.firstName, "firstName", String);
        checkPropertyExists(user.personalInformation.lastName, "lastName", String);
        checkPropertyExists(user.personalInformation.DOB, "DOB", String);
        user.personalInformation.DOB = Date(user.personalInformation.DOB);
        if(!user.personalInformation.DOB) throw new Error("Could not create user, DOB could not be parsed");
        checkPropertyExists(user.personalInformation.description, "description", String);
        user.personalInformation.city = await getCityFromLocation(user.personalInformation.location);

        checkPropertyExists(user.experience, "experience", [Object]);
        user.experience.forEach(exp => {
            checkPropertyExists(exp.title, "experience title", String);
            checkPropertyExists(exp.description, "experience description", String);
            checkPropertyExists(exp.months, "experience months", Number);
            checkPropertyExists(exp.isEducation, "experience isEducation", Boolean);
            checkPropertyExists(exp.isPresent, "experience isPresent", Boolean); 
            checkTags(exp.tags, "experience tags")
        });

        checkPropertyExists(user.interests, "interests", Object);
        checkPropertyExists(user.interests.maxDistance, "maxDistance", Number);
        checkTags(user.interests.tags, "interest tags");
        checkInRange(user.interests.hoursPerWeek, "hoursPerWeek", 1, 60); // TODO: Discuss those numbers
        checkInRange(user.interests.hoursFlexibility, "hoursFlexibility", 1, 100); // TODO: Discuss those numbers
        checkInRange(user.interests.companySize, "companySize", 1, 100); // TODO: Discuss those numbers
        checkPropertyExists(user.interests.isRemoteOnly, "isRemoteOnly", Boolean);
        
        user.dateCreated = user.dateLastModified = Date.now();

        // TODO: change that
        user.profilePictureURL = "https://image-cdn.essentiallysports.com/wp-content/uploads/dwayne-johnson-3-4.jpg?width=900";

        const newUser = await UserProfiles.create(user);

        return res.status(201).json({'message':'Success creating user'});
    }catch (error){
        res.status(400).json({'message':error.message});
    }
}

const getCityFromLocation = async (location) => {
    checkPropertyExists(location, "location", [Number]);

    if(Math.abs(location[0]) > 90.0)
        throw new Error("Latitude is not in range [-90, 90]");
    if(Math.abs(location[1]) > 180.0)
        throw new Error("Latitude is not in range [-180, 180]");

    const res = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+
    location[0]+"&longitude="+location[1]+"&localityLanguage=en").then(res => res.json());

    if(!res.city) 
        throw new Error("Error getting a city from location");

    return res.city;
}

module.exports = {createUser}
