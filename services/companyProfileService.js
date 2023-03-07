const mongoose = require('mongoose');

const companyProfileSchema = require('../models/companyProfile');
const positionSchema = require('../models/position');
const consumerSchema = require('../models/consumer');

const {checkPropertyExists, checkInRange, checkTags} = require('../hooks/propertyCheck');
const {uploadImage, updateImage, getImage, deleteImage} = require('../hooks/imageHandler');
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
    const newCompany = await companyProfileSchema.create({consumerId: consumer._id, positions:[], profilePicture: {name:''}});
    consumer.profileId = newCompany._id;
    await consumerSchema.findByIdAndUpdate(consumer._id, {profileId: newCompany._id});
    return newCompany;
}

const setCompanyInformation = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {name, description, size, industry} = req.body;

        checkPropertyExists(name, "name", "string", "create company");
        checkPropertyExists(description, "description", "string", "create company");
        checkPropertyExists(size, "size", "number", "create company");
        checkPropertyExists(industry, "industry", "string", "create company");

        company.name = name;
        company.description = description;
        company.size = size;
        company.industry = industry;

        if(!company.positions)
            company.positions = [];

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set company information'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const addPosition = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, 
            isHybrid, isRemote, branchSize, acceptMinors, location, fillGoalCount} = req.body;

        const position = await checkPositionValid(null, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, 
            isInPerson, isHybrid, isRemote, branchSize, acceptMinors, location, fillGoalCount);

        position.information.companyId = company._id;
        
        const createdPosition = await positionSchema.create(position);
        company.positions.push(createdPosition._id);

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully created poisiton'});
    } catch (err) {
        // console.error(err)
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const editPosition = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const {title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, 
            isHybrid, isRemote, branchSize, acceptMinors, location, fillGoalCount} = req.body;
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "edit position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        const positon = await positionSchema.findById(company.positions[index]);

        if(!positon)
            throw new Error("could not find position")

        await checkPositionValid(positon, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, 
            isInPerson, isHybrid, isRemote, branchSize, acceptMinors, location, fillGoalCount);

        await positionSchema.findByIdAndUpdate(positon._id, positon);

        return res.status(200).json({'status': 'success', 'message':'successfully editted poisiton'});
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

        return res.status(200).json({'status': 'success', 'message':'successfully deleted poisiton'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const checkPositionValid = async (position, title, description, payRange, hoursPerWeek, skills, hoursFlexibility, isInPerson, 
    isHybrid, isRemote, branchSize, acceptMinors, location, fillGoalCount) => {
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
    checkPropertyExists(branchSize, "branchSize", "number", "create position");
    checkPropertyExists(acceptMinors, "acceptMinors", "boolean", "create position");
    const city = await getCityFromLocation(location);
    checkPropertyExists(fillGoalCount, "fillGoalCount", "number", "create position");
    if(fillGoalCount<1) 
        throw new Error("fill goal must be above 1");

    console.log(hoursFlexibility, fillGoalCount);

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

        position.settings.acceptMinors = acceptMinors;
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
                positionPicture:{
                    name: null
                }
            },
            settings:{
                acceptMinors,
                location,
                fillGoalCount
            }
        }
    }
}

const setProfilePhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        const imageName = await updateImage(company.profilePicture.name, req.body, req.headers, 512, 512);

        company.profilePicture.name = imageName;

        await companyProfileSchema.findByIdAndUpdate(company._id, company);   

        return res.status(200).json({'status': 'success', 'message':'successfully set profile picture'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getProfilePhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);

        const url = await getImage(company.profilePicture.name);
        
        return res.status(200).json({'status': 'success', 'message':'successfully got picture url', 'pictureUrl': url});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const setPositionPhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "edit position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        let position = await positionSchema.findById(company.positions[index]);

        if(!position)
            throw new Error("could not find position")

        const imageName = await updateImage(position.information.positionPicture.name, req.body, req.headers, 1080, 1920); //Can Resolution here

        console.log(imageName)
        // positon.information.positionPicture = {};
        position.information.positionPicture.name = `${imageName}`;

        console.log(position)

        await positionSchema.findByIdAndUpdate(position._id, position);

        return res.status(200).json({'status': 'success', 'message':'successfully set position picture'});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getPositionPhoto = async (req, res) => {
    try {
        const company = await getCompanyFromHeader(req);
        const index = Number(req.params.index);

        checkPropertyExists(index, "index", "number", "edit position")

        if(index >= company.positions.length)
            throw new Error("Position does not exist");

        const positon = await positionSchema.findById(company.positions[index]);

        if(!positon)
            throw new Error("could not find position")

        // console.log(positon.information, positon.information.positionPicture)

        const url = await getImage(positon.information.positionPicture.name);
        
        return res.status(200).json({'status': 'success', 'message':'successfully got picture url', 'pictureUrl': url});
    } catch (err) {
        console.error(err)
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}

const getPublicInfo = async (id) => {
    const company = await companyProfileSchema.findById(id);
    if( !company )
        throw new Error("Company does not exist");
    const { consumerId, positions, ...ret } = company; // ommit consumerId and positions
    return ret;
}

const getPublicPositionInfo = async (id) => {

    const position = await positionSchema.findById(id);

    if(!position)
        throw new Error("Position does not exist");

    const companyInfo = getPublicPositionInfo(position.companyId)

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
                    pos.information.isHybrid, pos.information.isRemote, pos.information.branchSize, 
                    pos.settings.acceptMinors, pos.settings.location, pos.settings.fillGoalCount)
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

        const positon = await positionSchema.findById(company.positions[index]);

        if(!positon)
            throw new Error("could not find position")

        return res.status(200).json({'status': 'success', 'message':'successfully got position info', 'position': positon});
    } catch (err) {
        res.status(400).json({'status': 'failure', 'message': err.message});
    }
}


const deleteCompanyProfile = async (id) => {
    const company = companyProfileSchema.findById(id);
    
    if(!company)
        throw new Error("Company Not Found");

    deleteImage(company.profilePicture.name);

    company.positions.forEach(async (pos) => {
        await positionSchema.deleteOne({_id: pos})
        deleteImage(pos.positionPicture.name);
    });

    await companyProfileSchema.deleteOne({_id: id})
}



// TODO: Make sure that positions are deleted when company consumer is deleted.

module.exports = {setCompanyInformation, addPosition, editPosition, deletePosition, getPublicInfo, getCompleteInfo, getCompletePositionInfo,
    getProfilePhoto, setProfilePhoto, getPositionPhoto, setPositionPhoto, getPublicPositionInfo, completeCompany, deleteCompanyProfile}
