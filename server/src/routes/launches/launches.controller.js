const {
    getAllLaunches,
    sheduleNewLaunch,
    findLaunch,
    abortLaunchById
} = require('../../models/launches.model')

const {getPagination}= require('../../services/query')

 async function httpGetAllLaunches (req, res){
    const{skip, limit} = getPagination(req.query);
    const launches = await getAllLaunches(skip, limit)
    return res.status(200).json(launches);
}

async function httpAddNewLaunch (req, res){
    const launch = req.body
    console.log(launch)
    if(!launch.mission || !launch.rocket || !launch.launchDate || !launch.target){
        return res.status(400).json({
            error: "Missing required json property"
        })
    }
    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)){
        return res.status(400).json({
            error: 'Invalid launch date'
        })
    }
    try{
    await sheduleNewLaunch(launch)
    return res.status(201).json(launch);
    }
    catch (err){
        return res.status(400).json({
            error: err.message
        });
    }
    
}

async function httpAbortLaunch(req,res){
  const launchId = Number(req.params.id);
  const existLaunch = await findLaunch({flightNumber:launchId});
    if(! existLaunch){
  return res.status(404).json({
    error:'Launch not found'
  })
  }
  else{
    const aborted = await abortLaunchById(launchId);
    if(aborted){
        return res.status(200).json({ok: true} )
    }else{
        return res.status(400).json({
            error: 'Launch not aborted'
        })
    }

  }
}

module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
    abortLaunchById
};