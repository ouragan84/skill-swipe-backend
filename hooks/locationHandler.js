// import fetch from 'node-fetch';

const {checkPropertyExists} = require('./propertyCheck')

const getCityFromLocation = async (location) => {
    checkPropertyExists(location, "location", "object");
    checkPropertyExists(location[0], "latitude", "number");
    checkPropertyExists(location[1], "longitude", "number");

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

const getDistance = (loc1, loc2) => {
    // in rad
    const lat1 = loc1[0] * Math.PI / 180; 
    const lat2 = loc2[0] * Math.PI / 180;
    const lon1 = loc1[1] * Math.PI / 180;
    const lon2 = loc2[1] * Math.PI / 180;

    const d = Math.acos( Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1) ) * 6371; // in km

    return d * 0.621371; // in miles 
}

module.exports = {getCityFromLocation, getDistance};