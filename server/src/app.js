const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');

const api = require ('./routes/api')

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(morgan('combined')); // http logger middleware for node.js

app.use(express.json());// conver all data to json format
app.use(express.static(path.join(__dirname,'..', 'public')));// use frontend files

app.use('/v1', api);// create v1 of our api

app.get('/*', (req, res)=>{
    res.sendFile(path.join(__dirname,'..','public','index.html' ))// send  client
})

module.exports = app;