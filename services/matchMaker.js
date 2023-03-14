const userProfileSchema = require('../models/userProfile');
const positionSchema = require('../models/position');
const consumerSchema = require('../models/consumer');
const companyProfileSchema = require('../models/companyProfile');
const {getDistance} = require('../hooks/locationHandler');
const positionSchema = require('../models/position');
const {getPublicPositionInfo} = require('./companyProfileService');
const {getPublicInfo} = require('./userProfileService');


// TODO: In the future use a redis cache for faster fetches
const getNextPosition = async (user) => {
    const max1 = {id: null, score: 0};
    const max2 = {id: null, score: 0};

    (await positionSchema.find()).forEach( (pos) => {
        if(user.status.liked.has(pos._id) || user.status.interviewing.has(pos._id) || user.status.rejected.has(pos._id))
            return;

        const score = getCompatibilityScore(user, pos);
        if(score > max1.score){
            if(max1.score > max2.score){
                max2.id = max1.id;
                max2.score = max1.score;
            }
            max1.id = pos._id;
            max1.score = score;
        }else if(score > max2.score){
            max2.id = pos._id;
            max2.score = score;
        }
    })

    return {firstCard: max1.id? getPublicPositionInfo(max1._id) : null, secondCard: max2.id? getPublicPositionInfo(max2._id) : null}

    // would handle looking at how many applicants we show job to in this function
}

const getNextUser = async (position) => {
    const max1 = {id: null, score: 0};
    const max2 = {id: null, score: 0};

    position.status.applicants.forEach( async (value, key, map) => {

        const user = await userProfileSchema.findById(value);

        const score = getCompatibilityScore(user, position);
        if(score > max1.score){
            if(max1.score > max2.score){
                max2.id = max1.id;
                max2.score = max1.score;
            }
            max1.id = user._id;
            max1.score = score;
        }else if(score > max2.score){
            max2.id = user._id;
            max2.score = score;
        }
    })

    return {firstCard: max1.id? getPublicInfo(max1._id) : null, secondCard: max2.id? getPublicInfo(max2._id) : null}
    
}

const getCompatibilityScore = (user, position) => {
    let score = 1;
    const dist = getDistance(user);
    if(dist > user.preferences.maxDistance)
        score *= 0.5;
    else
        score *= 1 - (1-.8) * dist / user.preferences.maxDistance;

    score *= (position.information.isInPerson == user.preferences.isInPerson)? 1 : 0.8;
    score *= (position.information.isHybrid == user.preferences.isHybrid)? 1 : 0.8;
    score *= (position.information.isRemote == user.preferences.isRemote)? 1 : 0.8;
    
    score *= compareRanges(user.preferences.hoursPerWeek, position.information.hoursPerWeek);

    // TODO: add other field and settings

    const months = getRelevantExperience(user, position);

    if(months < position.settings.monthsRelevantExperience[0])
        score *= months/position.settings.monthsRelevantExperience[0];
    else if(months > position.settings.monthsRelevantExperience[1])
        score *= position.settings.monthsRelevantExperience[1]/months; 

    return score;
}

const applyToPosition = async (user, position) => {
    const time = Date.now();

    user.status.liked.set(position._id, {time});
    position.status.applicants.set(user._id, {time});

    await positionSchema.findByIdAndUpdate(position._id, position);
    await userProfileSchema.findByIdAndUpdate(user._id, user);
}

const rejectPosition = async (user, position) => {
    const time = Date.now();

    user.status.rejected.set(position._id, {time})

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

    return months;
}

const compareRanges = (r1, r2) => {
    const score = 1;

    if(r1[0] > r2[0] && r1[0] < r2[1])
        score *= 1;
    else
        score *= 0.9;

    if(r[1] > r2[0] && r1[1] < r2[1])
        score *= 1;
    else
        score *= 0.9;

    return score;
}

module.exports = {getNextPosition, getNextUser, applyToPosition, rejectPosition, acceptApplicant, rejectApplicant}