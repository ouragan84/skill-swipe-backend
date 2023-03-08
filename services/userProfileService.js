const mongoose = require('mongoose');

const userProfileSchema = require('../models/userProfile');
const consumerSchema = require('../models/consumer');

const {checkPropertyExists, checkInRange, checkTags} = require('../hooks/propertyCheck');
const {uploadImage, updateImage, getImage, deleteImage} = require('../hooks/imageHandler');
const {getCityFromLocation} = require('../hooks/locationHandler');

const getUserFromHeader = async (req) => {
    const consumer = req.consumer;
    if( !consumer )
        throw new Error("no consumer found");
    if( !consumer.isTypeUser)
        throw new Error("consumer is not of type user");
    if(consumer.profileId){
        const current_user = await userProfileSchema.findById(consumer.profileId);
        if( current_user )
            return current_user
    }
    const newUser = await userProfileSchema.create({consumerId: consumer._id});
    consumer.profileId = newUser._id;

    await consumerSchema.findByIdAndUpdate(consumer._id, {profileId: newUser._id});
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

        if(!user.experience)
            user.experience = [];

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

        const exp = ckeckExperienceValid(user, title, description, years, months, isCurrent, skills);

        user.experience.push(exp);

        await userProfileSchema.findByIdAndUpdate(user._id, user);

        return res.status(200).json({'status': 'success', 'message':'successfully added experience'});
    } catch (err) {
        console.error(err);
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const editExperience = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const index = Number(req.params.index);
        const {title, description, years, months, isCurrent, skills} = req.body;

        checkPropertyExists(index, "index", "number", "edit experience")

        if(index >= user.experience.length)
            throw new Error("Experience does not exist");

        const exp = ckeckExperienceValid(user, title, description, years, months, isCurrent, skills);

        user.experience[index] = exp;

        await userProfileSchema.findByIdAndUpdate(user._id, user);

        return res.status(200).json({'status': 'success', 'message':'successfully editted experience'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const deleteExperience = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "delete experience")

        if(index >= user.experience.length)
            throw new Error("Experience does not exist");

        user.experience.splice(index, 1);

        await userProfileSchema.findByIdAndUpdate(user._id, user);

        return res.status(200).json({'status': 'success', 'message':'successfully deleted experience'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const ckeckExperienceValid = (user, title, description, years, months, isCurrent, skills) => {
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

    return {
        title: title,
        description: description,
        months: (years * 12 + months),
        isCurrent: isCurrent,
        skills: [...skills]
    }
}

const setPreferences = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {maxDistance, hoursPerWeek, hoursFlexibility, companySize, isInPerson, isHybrid, isRemote} = req.body;

        checkPropertyExists(maxDistance, "maxDistance", "number");
        checkInRange(hoursPerWeek, "hoursPerWeek", 1, 40);
        checkInRange(hoursFlexibility, "hoursFlexibility", 1, 3); // 1 = rigid, 2 = normal, 3 = flexible
        checkInRange(companySize, "companySize", 1, 100); // 1 = 1, 2 = 10, 3 = 50, 4 = 100, 5 = 500, 6 = inf
        checkPropertyExists(isInPerson, "isInPerson", "boolean");
        checkPropertyExists(isHybrid, "isHybrid", "boolean");
        checkPropertyExists(isRemote, "isRemote", "boolean");

        user.preferences.maxDistance = maxDistance;
        user.preferences.hoursPerWeek = hoursPerWeek;
        user.preferences.hoursFlexibility = hoursFlexibility;
        user.preferences.companySize = companySize;
        user.preferences.isInPerson = isInPerson;
        user.preferences.isHybrid = isHybrid;
        user.preferences.isRemote = isRemote;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set preferences'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const setSkillPreferences = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {skills} = req.body;

        checkTags(skills, "preference skill tags");
        if(skills.length <= 0)
            throw new Error("Please add at least one skill tag")

        user.preferences.skills = skills;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set preference skills'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const setProfilePhoto = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);

        const imageName = await updateImage(user.profilePicture.name, req.body, req.headers, 1024, 1024);

        user.profilePicture.name = imageName;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set profile picture'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getProfilePhoto = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);

        const url = await getImage(user.profilePicture.name, 'default-user-profile.jpg');
        
        return res.status(200).json({'status': 'success', 'message':'successfully got picture url', 'pictureUrl': url});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const setDescription = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        const {description} = req.body;

        checkPropertyExists(description, "description", "string");

        user.personalInformation.description = description;

        await userProfileSchema.findByIdAndUpdate(user._id, user);   

        return res.status(200).json({'status': 'success', 'message':'successfully set location'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const completeUser = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);

        checkPropertyExists(user.personalInformation.firstName, "firstName", "string");
        checkPropertyExists(user.personalInformation.lastName, "lastName", "string");
        checkPropertyExists(user.personalInformation.DOB, "DOB", "object");
        checkPropertyExists(user.personalInformation.firstName, "city", "string");
        await getCityFromLocation(user.personalInformation.location);
        checkPropertyExists(user.personalInformation.firstName, "description", "string");

        checkPropertyExists(user.experience, "experiences", "object")
        user.experience.forEach(exp => {
            checkPropertyExists(exp.title, "title", "string");
            checkPropertyExists(exp.description, "description", "string");
            checkPropertyExists(exp.months, "months", "number");
            checkPropertyExists(exp.isCurrent, "isCurrent", "boolean");
            checkTags(exp.skills, "skill tags");
        });

        // checkPropertyExists(user.profilePicture, "profilePicture", "object")
        // checkPropertyExists(user.profilePicture.name, "profilePicture name", "string")

        checkPropertyExists(user.preferences, "preferences", "object")
        checkPropertyExists(user.preferences.maxDistance, "maxDistance", "number");
        checkInRange(user.preferences.hoursPerWeek, "hoursPerWeek", 5, 40);
        checkInRange(user.preferences.hoursFlexibility, "hoursFlexibility", 1, 3); // 1 = rigid, 2 = normal, 3 = flexible
        checkInRange(user.preferences.companySize, "companySize", 1, 100); // 1 = 1, 2 = 10, 3 = 50, 4 = 100, 5 = 500, 6 = inf
        checkPropertyExists(user.preferences.isInPerson, "isInPerson", "boolean");
        checkPropertyExists(user.preferences.isHybrid, "isHybrid", "boolean");
        checkPropertyExists(user.preferences.isRemote, "isRemote", "boolean");
        checkTags(user.preferences.skills, "preference skill tags");

        const consumer = req.consumer;
        consumer.isAccountComplete = true;

        await consumerSchema.findByIdAndUpdate(consumer._id, consumer);

        return res.status(200).json({'status': 'success', 'message':'user is complete'});
    } catch (err) {
        // console.error(err)
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getPublicInfo = async (id) => {
    const user = await userProfileSchema.findById(id);
    if( user ){
        console.log( user.personalInformation)
        const { DOB, location, ...personalInformation } = user.personalInformation; // ommit DOB and location

        return {
            personalInformation,
            profilePicture: user.profilePicture,
            experience: user.experience
        }
    }
    throw new Error("User does not exist");
}

const getCompleteInfo = async (req, res) => {
    try {
        const user = await getUserFromHeader(req);

        const { status, ...ret } = user; // ommit status

        return res.status(200).json({'status': 'success', 'message':'successfully got public user info', 'user': ret});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const deleteUserProfile = async (id) => {
    const user = userProfileSchema.findById(id);
    
    if(!user)
        throw new Error("User Not Found");

    deleteImage(user.profilePicture.name);

    await userProfileSchema.deleteOne({_id: id})
}

module.exports = {setUserPersonalInformation, addExperience, setLocation, setPreferences, setSkillPreferences, getCompleteInfo,
    setProfilePhoto, setDescription, getProfilePhoto, getPublicInfo, completeUser, editExperience, deleteExperience, deleteUserProfile}
