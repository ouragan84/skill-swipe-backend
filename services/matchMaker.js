const userProfileSchema = require('../models/userProfile');
const positionSchema = require('../models/position');
const consumerSchema = require('../models/consumer');
const companyProfileSchema = require('../models/companyProfile');
const {getDistance} = require('../hooks/locationHandler');
const {getPublicPositionInfo} = require('./companyProfileService');
const {getPublicInfo} = require('./userProfileService');


// TODO: In the future use a redis cache for faster fetches
const getListPositions = async (user /*, size*/) => {

    let list = [];//Array(size).fill({card: null, score: -1});

    let allPositions = (await positionSchema.find()); // yikes

    for(let j = 0; j < allPositions.length; ++j){

        const pos = allPositions[j];

        const pos_company = await companyProfileSchema.findById(pos.information.companyId);
        const pos_consumer = await consumerSchema.findById(pos_company.consumerId);

        if(!pos_consumer.isAccountComplete)
            continue;

        if(user.status.liked.has(`${pos._id}`) || user.status.interviewing.has(`${pos._id}`) || user.status.rejected.has(`${pos._id}`)){
            // console.log("HEY")
            continue;
        }

        const {score, distance} = getCompatibilityScore(user, pos);

        // console.log(`-> ${pos.information.title} = ${score}  -  ${distance} mi`)

        let i;
        for(i = 0; i < list.length; ++i){
            if(score > list[i].score){
                // console.log(`   ADDING in ${i}th position : ${list.toString()}` )
                break;
            }
        }

        const card = (await getPublicPositionInfo(pos._id));
        card.distance = distance;
        card.id = pos._id;
        list.splice(i,0,{card, score});
    }

    // ADD DISTANCE TO CARDS
    // return {firstCard: max1.id? getPublicPositionInfo(max1._id) : null, secondCard: max2.id? getPublicPositionInfo(max2._id) : null}

    let listOfCards = []

    list.forEach(c => {
        listOfCards.push(c.card);
        console.log(" -> " + (c.card ? c.card.positionInfo.title : "null"))
    });

    console.l

    return listOfCards;

    // would handle looking at how many applicants we show job to in this function
}

const getListUsers = async (position/*, size*/) => {
    let list = [];//Array(size).fill({card: null, score: -1});

    let allApplicants = Array.from(position.status.applicants, ([key]) => (key));
    
    for(let j = 0; j < allApplicants.length; ++j){

        const user = await userProfileSchema.findById(allApplicants[i]);

        const {score, distance} = getCompatibilityScore(user, position);

        let i;
        for(i = 0; i < list.length; ++i){
            if(score > element.score)
                break;
        }

        const card = await getPublicInfo(user.id);
        card.distance = distance;
        card.id = pos._id;
        list.splice(i,0,{card, score});
    }

    let listOfCards = []

    list.forEach(c => {
        listOfCards.push(c.card);
        console.log(" -> " + (c.card ? c.card.positionInfo.title : "null"))
    });

    return listOfCards;
}

const getCompatibilityScore = (user, position) => {
    let score = 1;
    const dist = getDistance(user.personalInformation.location, position.settings.location);
    if(dist > user.preferences.maxDistance)
        score *= 0.5;
    else
        score *= 1;

    score *= (position.information.isInPerson == user.preferences.isInPerson)? 1 : 0.8;
    score *= (position.information.isHybrid == user.preferences.isHybrid)? 1 : 0.8;
    score *= (position.information.isRemote == user.preferences.isRemote)? 1 : 0.8;
    
    score *= compareRanges(user.preferences.hoursPerWeek, position.information.hoursPerWeek);

    // TODO: add other field and settings

    const months = getRelevantExperience(user, position);

    if(months < position.settings.monthsRelevantExperience[0])
        score *= 0.6;//months/position.settings.monthsRelevantExperience[0];
    else if(months > position.settings.monthsRelevantExperience[1])
        score *= 0.8;//position.settings.monthsRelevantExperience[1]/months; 
    else
        score *= 1;

    return {score, distance: dist};
}

const applyToPosition = async (user, position) => {
    const time = Date.now();

    user.status.liked.set(position._id, {time});
    position.status.applicants.set(user._id, {time});

    // console.log("USER AFTER APPLY: ", user, user.status.liked, user.status.rejected)
    // console.log("POS AFTER APPLY: ", position, position.status.applicants)

    await positionSchema.findByIdAndUpdate(position._id, position);
    await userProfileSchema.findByIdAndUpdate(user._id, user);
}

const rejectPosition = async (user, position) => {
    const time = Date.now();

    user.status.rejected.set(position._id, {time})

    // console.log("USER AFTER REJECT: ", user, user.status.liked, user.status.rejected)
    // console.log("POS AFTER REJECT: ", position, position.status.applicants)

    await userProfileSchema.findByIdAndUpdate(user._id, user);
}

const acceptApplicant = async (position, user) => {
    const time = Date.now();

    position.status.interviewees.set(user._id, {time});
    position.status.applicants.delete(user._id);

    user.status.interviewing.set(position._id, {time});
    user.status.liked.delete(position._id);

    await positionSchema.findByIdAndUpdate(position._id, position);
    await userProfileSchema.findByIdAndUpdate(user._id, user);
}

const rejectApplicant = async (position, user) => {
    const time = Date.now();

    position.status.rejected.set(user._id, {time});
    position.status.interviewees.delete(user._id);
    position.status.applicants.delete(user._id);

    user.status.rejected.set(position._id, {time});
    user.status.liked.delete(position._id);
    user.status.interviewing.delete(position._id);

    await positionSchema.findByIdAndUpdate(position._id, position);
    await userProfileSchema.findByIdAndUpdate(user._id, user);
}

const getRelevantExperience = (user, position) => {
    let months = 0;
    const skills = new Map();

    for(let i = 0; i < position.information.skills.length; ++i){
        let imp = 0;
        switch (position.settings.skillsImportance[i]){
            case 1: imp = .5; break;
            case 2: imp = .75; break;
            case 3: imp = 1; break;
            default: imp = 0;
        }
        skills.set(position.information.skills[i], imp);
    }

    user.experience.forEach(exp => {
        let expImp = 0;
        exp.skills.forEach(skill => {
            if(skills.has(skill) && skill.get(skill) > expImp)
                expImp = skill.get(skill);
        });
        months += expImp * exp.months;
    });

    // console.log(months)

    return months;
}

const compareRanges = (r1, r2) => {
    let score = 1;

    if(r1[0] > r2[0] && r1[0] < r2[1])
        score *= 1;
    else
        score *= 0.9;

    if(r1[1] > r2[0] && r1[1] < r2[1])
        score *= 1;
    else
        score *= 0.9;

    return score;
}

module.exports = {getListPositions, getListUsers, applyToPosition, rejectPosition, acceptApplicant, rejectApplicant}