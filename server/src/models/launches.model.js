const axios = require('axios');

const launches = require('./launches.mongo')
const planets = require ('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

async function getAllLaunches(skip, limit) {
    return await launches.find({}, { // find all lanches and filer out id and version number
    '_id':0,
    '__v':0
  }).sort({flightNumber:1}).skip(skip).limit(limit);
}

async function getLatestFlightNumber(){
  const latestLaunch = await launches.findOne().sort('-flightNumber');
  if(!latestLaunch){
    return DEFAULT_FLIGHT_NUMBER;
  }
  else{
    return latestLaunch.flightNumber;
  }
}

async function  saveLaunch(launch){
    await  launches.findOneAndUpdate({
        flightNumber: launch.flightNumber
        },launch,{
          upsert: true
         });
}

async function sheduleNewLaunch(launch){
     const newLaunch = Object.assign(
      launch,{
      flightNumber: await getLatestFlightNumber()+1,
      success: true,
      upcoming: true,
      customers: ['Zero to mastery', 'NASA']
      }
     );
    const planet =  await  planets.findOne({keplerName: launch.target})
     if(!planet){
         throw new Error('No matching planet found');
     }
     await  saveLaunch (newLaunch);
}

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query'

async function findLaunch (filter){
  return  await launches.findOne(filter);
}

async function populateLaunches() {
  const requestLaunches = await axios.post(SPACEX_API_URL,{
    query:  {},
    options:{
      pagination: false,  
      populate: [{
           path: 'rocket',
           select: {
              name: 1
             }
           },
           {
            path: 'payloads',
            select: {
               customers: 1
              }
            }
         ]
    }
});

if(requestLaunches.status !==200){
  console.log("Problem downloading launch data");
  throw new Error("Launch data downloading failed")
}

const launchDocs = requestLaunches.data.docs;
for(const launchDoc of launchDocs){
  let customers = launchDoc.payloads.flatMap((payload)=>{
     return payload.customers
  });

  const launch ={
    flightNumber: launchDoc.flight_number,
    mission: launchDoc.name,
    rocket: launchDoc.rocket.name,
    launchDate: launchDoc.date_local,
    upcoming: launchDoc.upcoming,
    success: launchDoc.success,
    customers
  }
  await saveLaunch(launch)
 }
}

async function loadLaunchData() {
const firstLaunch =   await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  })
  if(firstLaunch){
    console.log("Launch data already loaded");
  }else{
   await  populateLaunches()
  }
}

async function abortLaunchById(launchId){
 const aborted = await  launches.updateOne({
    flightNumber: launchId
  },{
    upcoming: false,
    success: false
  });
   return aborted.modifiedCount === 1 ; 
}

module.exports = {
    getAllLaunches,
    findLaunch,
    abortLaunchById,
    sheduleNewLaunch,
    loadLaunchData
}