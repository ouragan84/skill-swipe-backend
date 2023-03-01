const mongoose = require('mongoose');

const userProfileSchema = require('../models/userProfile');
const consumerSchema = require('../models/consumer');

const {checkPropertyExists, checkInRange, checkTags} = require('../hooks/propertyCheck');

const getUserFromHeader = async (req) => {
    const consumer = req.consumer;
    if( !consumer )
        throw new Error("no consumer found");
    if( !consumer.isTypeUser)
        throw new Error("consumer is not of type user");
    if(consumer.consumerId){
        const current_user = userProfileSchema.findById(consumer.consumerId);
        if( current_user )
            return current_user
    }
    const newUser = await userProfileSchema.create({});
    consumer.consumerId = newUser._id;
    await consumerSchema.findByIdAndUpdate(consumer._id, {consumerId: newUser._id});
    return newUser;
}

const setUserPersonalInformation = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {firstName, lastName, DOB} = req.body;

        checkPropertyExists(firstName, "firstName", "string", "create user");
        checkPropertyExists(lastName, "lastName", "string", "create user");
        checkPropertyExists(DOB, "DOB", "string", "create user");

        const date= DOB.split("/");
        if(date.length != 3)
            throw new Error("Date is not in the right format");

        const DateOfBirth = new Date(date[2], date[0] - 1, date[1]);
        const age = getAge(DateOfBirth);

        if(age < 0)
            throw new Error("Date is not valid")
        if(age < 16)
            throw new Error("User is too young")
        if(age > 120)
            throw new Error("Date is not valid")

        user.personalInformation.firstName = firstName;
        user.personalInformation.lastName = lastName;
        user.personalInformation.DOB = DateOfBirth;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set first name, last name, and DOB'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getAge = (DOB) => {
    const today = new Date();
    let age = today.getFullYear() - DOB.getFullYear();
    if (today.getMonth() < DOB.getMonth() || (today.getMonth() == DOB.getMonth() && today.getDate() < DOB.getDate())) {
        age--;
    }
    return age;
}

const setLocation = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {latitude, longitude} = req.body;

        const location = [latitude, longitude];

        user.personalInformation.city = await getCityFromLocation(location);
        user.personalInformation.location = location;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set location'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const addExperience = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {title, description, years, months, isCurrent, skills} = req.body;
        const exp = {};

        checkPropertyExists(title, "title", "string", "add experience");
        checkPropertyExists(description, "description", "string", "add experience");
        checkPropertyExists(years, "years", "number", "add experience");
        checkPropertyExists(months, "months", "number", "add experience");
        checkPropertyExists(isCurrent, "isCurrent", "boolean", "add experience");
        checkTags(skills, "skill tags");
        if(skills.length > 5)
            throw new Error("Too many skill tags added")
        if(skills.length <= 0)
            throw new Error("Please add at least one skill tag")


        const age = getAge(new Date(user.personalInformation.DOB));
        

        if(months >= 12 || months < 0)
            throw new Error("months is not valid")
        if(years >= age || years < 0)
            throw new Error("years is not valid")

        user.experience.push(exp);
        // await user.save();

        // await userProfileSchema.findByIdAndUpdate(user._id, user);

        return res.status(200).json({'status': 'success', 'message':'successfully added experience'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

// Experiences -> Title Description Years Months Current Skills
// Prefs -> Maxdist HoursPerWeek[2] companySize[2] Remote Hybrid InPerson Flexibility 
// Prefs -> Skills
// ProfilePicture Description
// CheckFinal



const hello = async (req, res) => {
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

module.exports = {setUserPersonalInformation, addExperience, setLocation}
