const mongoose = require('mongoose')
require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', ()=>{
    console.log('MongoDB connection ready');
})

mongoose.connection.on('error', (err)=> {
    console.error(err);
})

async function mongoDisconect(){
    await mongoose.disconnect() 
}

async function connectToMongo() {
    await mongoose.connect(MONGO_URL);
}

module.exports = {
    connectToMongo,
    mongoDisconect
};