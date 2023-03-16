const mongoose = require('mongoose');

const companyProfileSchema = require('../models/companyProfile');
const positionSchema = require('../models/position');
const consumerSchema = require('../models/consumer');
const {omit} = require('../hooks/objectHelper');

const {checkPropertyExists, checkInRange, checkTags} = require('../hooks/propertyCheck');
const {uploadImage, updateImage, deleteImage} = require('../hooks/imageHandler');
const {getCityFromLocation} = require('../hooks/locationHandler');

const getCompanyFromHeader = async (req) => {
    const consumer = req.consumer;
    if( !consumer )
        throw new Error("no consumer found");
    if( consumer.isTypeUser)
        throw new Error("consumer is not of type company");
    if(consumer.profileId){
        const current_company = companyProfileSchema.findById(consumer.profileId);
        if( current_company )
            return current_company
    }
    const newCompany = await companyProfileSchema.create({consumerId: consumer._id});
    consumer.profileId = newCompany._id;
    await consumerSchema.findByIdAndUpdate(consumer._id, {profileId: newCompany._id});
    return newCompany;
}

// TODO: check length too for string
const setCompanyInformation = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {name, description, size} = req.body;

        checkPropertyExists(name, "name", "string", "create company");
        checkPropertyExists(description, "description", "string", "create company");
        checkPropertyExists(size, "size", "number", "create company");
        // checkPropertyExists(industry, "industry", "string", "create company");

        company.name = name;
        company.description = description;
        company.size = size;
        // company.industry = industry;

        if(!company.positions)
            company.positions = [];

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set company information'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const setIndustry = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {industry} = req.body;

        // checkPropertyExists(name, "name", "string", "create company");
        // checkPropertyExists(description, "description", "string", "create company");
        // checkPropertyExists(size, "size", "number", "create company");
        checkPropertyExists(industry, "industry", "string", "create company");

        // company.name = name;
        // company.description = description;
        // company.size = size;
        company.industry = industry;

        // if(!company.positions)
        //     company.positions = [];

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set company industry'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const addPosition = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, isHybrid, isRemote, branchSize, 
            acceptsOver16, acceptsOver18, acceptsOver21, monthsRelevantExperience, skillsImportance, location, fillGoalCount} = req.body;

        const position = await checkPositionValid(null, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, 
            isHybrid, isRemote, branchSize, acceptsOver16, acceptsOver18, acceptsOver21, monthsRelevantExperience, skillsImportance, location, fillGoalCount);

        position.information.companyId = company._id;
        
        const createdPosition = await positionSchema.create(position);
        company.positions.push(createdPosition._id);

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully created position'});
    } catch (err) {
        // console.error(err)
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const editPosition = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, isHybrid, isRemote, branchSize, 
            acceptsOver16, acceptsOver18, acceptsOver21, monthsRelevantExperience, skillsImportance, location, fillGoalCount} = req.body;
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "edit position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        const position = await positionSchema.findById(company.positions[index]);

        if(!position)
            throw new Error("could not find position")

        await checkPositionValid(position, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, isHybrid, 
            isRemote, branchSize, acceptsOver16, acceptsOver18, acceptsOver21, monthsRelevantExperience, skillsImportance, location, fillGoalCount);

        await positionSchema.findByIdAndUpdate(position._id, position);

        return res.status(200).json({'status': 'success', 'message':'successfully editted position'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const deletePosition = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "delete position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        await positionSchema.deleteOne({_id: company.positions[index]});

        company.positions.splice(index, 1);

        await companyProfileSchema.findByIdAndUpdate(company._id, company);

        return res.status(200).json({'status': 'success', 'message':'successfully deleted position'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const checkPositionValid = async (position, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, isHybrid, 
    isRemote, branchSize, acceptsOver16, acceptsOver18, acceptsOver21, monthsRelevantExperience, skillsImportance, location, fillGoalCount) => {

    checkPropertyExists(title, "title", "string", "create position");
    checkPropertyExists(description, "description", "string", "create position");
    checkInRange(payRange, "payRange", 5, 10000, "create position");
    checkInRange(hoursPerWeek, "hoursPerWeek", 1, 40, "create position");
    checkTags(skills, "skill tags");
    checkPropertyExists(hoursFlexibility, "hoursFlexibility", "number", "create position");
    if(hoursFlexibility<1 || hoursFlexibility>3) 
        throw new Error("hours flexibility must be in range 1 - 3");

    checkPropertyExists(isInPerson, "isInPerson", "boolean", "create position");
    checkPropertyExists(isHybrid, "isHybrid", "boolean", "create position");
    checkPropertyExists(isRemote, "isRemote", "boolean", "create position");
    if( (isInPerson?1:0) + (isHybrid?1:0) + (isRemote?1:0) != 1)
        throw new Error("Exactly one of isInPerson, isHybrid, or isRemote must be true");

    checkPropertyExists(acceptsOver16, "acceptsOver16", "boolean", "create position");
    checkPropertyExists(acceptsOver18, "acceptsOver18", "boolean", "create position");
    checkPropertyExists(acceptsOver21, "acceptsOver21", "boolean", "create position");
    if( (acceptsOver16?1:0) + (acceptsOver18?1:0) + (acceptsOver21?1:0) != 1)
        throw new Error("Exactly one of acceptsOver16, acceptsOver18, or acceptsOver21 must be true");
    
    checkInRange(monthsRelevantExperience, "monthsRelevantExperience", 0, 240, "create position");

    checkPropertyExists(skillsImportance, "skillsImportance", "object", "create position");

    if(skills.length <= 0)
        throw new Error("Please add at least one skill");

    if(skillsImportance.length != skills.length)
        throw new Error("skillsImportance must have as many elements as skills");

    skillsImportance.forEach(element => {
        if(element < 1 || element > 3)
            throw new Error("skillsImportance must be an array of numbers 1-3");
    });

    checkPropertyExists(branchSize, "branchSize", "number", "create position");
    const city = await getCityFromLocation(location);
    checkPropertyExists(fillGoalCount, "fillGoalCount", "number", "create position");
    if(fillGoalCount<1) 
        throw new Error("fill goal must be above 1");

    if(position){
        position.information.title = title;
        position.information.description = description;
        position.information.payRange = payRange;
        position.information.hoursPerWeek = hoursPerWeek;
        position.information.skills = skills;
        position.information.hoursFlexibility = hoursFlexibility;
        position.information.isInPerson = isInPerson;
        position.information.isHybrid = isHybrid;
        position.information.isRemote = isRemote;
        position.information.branchSize = branchSize;
        position.information.city = city;

        position.settings.acceptsOver16 = acceptsOver16;
        position.settings.acceptsOver18 = acceptsOver18;
        position.settings.acceptsOver21 = acceptsOver21;
        position.settings.skillsImportance = skillsImportance;
        position.settings.monthsRelevantExperience = monthsRelevantExperience;

        position.settings.location = location;
        position.settings.fillGoalCount = fillGoalCount;
    }else{
        return {
            information:{
                title,
                description,
                payRange,
                hoursPerWeek,
                skills,
                hoursFlexibility,
                isInPerson,
                isHybrid,
                isRemote,
                branchSize,
                city,
            },
            settings:{
                acceptsOver16,
                acceptsOver18,
                acceptsOver21,
                location,
                fillGoalCount,
                monthsRelevantExperience,
                skillsImportance
            }
        }
    }
}

const setProfilePhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        const imageName = await updateImage(company.profilePicture.name, req.body, req.headers, 1024, 1024);

        company.profilePicture.name = imageName;

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set profile picture'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

// const getProfilePhoto = async (req, res) => {
//     try {
//         const company = await getCompanyFromHeader(req);

//         const url = await getImage(company.profilePicture.name, 'default-company-profile.jpg');
        
//         return res.status(200).json({'status': 'success', 'message':'successfully got picture url', 'pictureUrl': url});
//     } catch (err) {
//         res.status(400).json({'status': 'failure', 'message': err.message});
//     }
// }

const setBannerPhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        const imageName = await updateImage(company.bannerPicture.name, req.body, req.headers, 1024, 1024);

        company.bannerPicture.name = imageName;

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set banner picture'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

// const getBannerPhoto = async (req, res) => {
//     try {
//         const company = await getCompanyFromHeader(req);

//         const url = await getImage(company.bannerPicture.name, 'default-company-banner.jpg');
        
//         return res.status(200).json({'status': 'success', 'message':'successfully got picture url', 'pictureUrl': url});
//     } catch (err) {
//         console.error(err)
//         res.status(400).json({'status': 'failure', 'message': err.message});
//     }
// }

const getPublicInfo = async (id) => {
    const company = await companyProfileSchema.findById(id);
    if( !company )
        throw new Error("Company does not exist");

    const ret = omit(company, 'consumerId', 'positions');

    return ret;
}

const getPublicPositionInfo = async (id) => {

    const position = await positionSchema.findById(id);

    if(!position)
        throw new Error("Position does not exist");

    const companyInfo = await getPublicInfo(position.information.companyId);

    return {
        positionInfo: position.information,
        companyInfo: companyInfo
    };
}

const completeCompany = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        checkPropertyExists(company.name, "name", "string");
        checkPropertyExists(company.description, "description", "string");
        checkPropertyExists(company.size, "size", "number");
        checkPropertyExists(company.industry, "industry", "string");
        checkPropertyExists(company.profilePicture.name, "profilePicture", "string");
        checkPropertyExists(company.positions, "positions", "object");

        // let positionsValid = true;

        for(let i = 0; i <  company.positions.length; ++i){
            const pos = await positionSchema.findById( company.positions[i]);
            await checkPositionValid(null, pos.information.title, pos.information.description, pos.information.payRange, 
                pos.information.hoursPerWeek, pos.information.skills, pos.information.hoursFlexibility, pos.information.isInPerson, 
                pos.information.isHybrid, pos.information.isRemote, pos.information.branchSize, pos.settings.acceptsOver16, 
                pos.settings.acceptsOver18, pos.settings.acceptsOver21, pos.settings.monthsRelevantExperience, 
                pos.settings.skillsImportance, pos.settings.location, pos.settings.fillGoalCount);
        }

        const consumer = req.consumer;
        consumer.isAccountComplete = true;

        await consumerSchema.findByIdAndUpdate(consumer._id, consumer);

        return res.status(200).json({'status': 'success', 'message':'company is complete'});
    } catch (err) {
        return res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getCompleteInfo = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        return res.status(200).json({'status': 'success', 'message':'successfully got complete info', 'company': company});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getCompletePositionInfo = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "edit position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        const position = await positionSchema.findById(company.positions[index]);

        if(!position)
            throw new Error("could not find position")

        const ret = omit(position, 'status');

        return res.status(200).json({'status': 'success', 'message':'successfully got position info', 'position': ret});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const deleteCompanyProfile = async (id) => {
    const company = await companyProfileSchema.findById(id);
    
    if(!company)
        throw new Error("Company Not Found");

    try{
        deleteImage(company.profilePicture.name);
    }catch{}

    try{
        deleteImage(company.bannerPicture.name);
    }catch{}

    company.positions.forEach(async (pos) => {
        await positionSchema.deleteOne({_id: pos})
    });

    await companyProfileSchema.deleteOne({_id: id})
}

module.exports = {setCompanyInformation, addPosition, editPosition, deletePosition, getPublicInfo, getCompleteInfo, 
    getCompletePositionInfo, setProfilePhoto, setBannerPhoto, getPublicPositionInfo, completeCompany, deleteCompanyProfile, setIndustry}
