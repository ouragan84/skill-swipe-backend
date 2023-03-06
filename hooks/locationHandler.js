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

module.exports = {getCityFromLocation};