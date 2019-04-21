require('dotenv').config();
const express = require('express');
const router = express.Router();
const TableStorage = require ('../src/TableStorage');
const azure = require('azure-storage');
const exec = require('child_process').exec;
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

let reqcounter = 0;
let insertcounter = 0;
let hostname = "unknown_host";
let dbUrl = "mongodb://10.0.0.70:27017/sortdb";
setHostname();
let mongo;
// getDatabaseConnection(function(db){
//    mongo = db;
// });

router.get('/', function(req, res, next) {
    reqcounter++;

    console.log("test");
    let numbers = doSort(1000);
    console.log(numbers);
    insertDocument(numbers);
    res.json({
        hostname: hostname,
        requestCtr: reqcounter,
        numbers: []
    });
});

router.get('/count/:count', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(req.params.count);
    insertDocument(numbers);
    res.json({
        hostname: hostname,
        requestCtr: reqcounter,
        count: req.params.count,
        numbers: []
    });
});

router.get('/:count/:numberResponse', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(req.params.count);
    if(req.params.numberResponse === 'false'){
        numbers=[];
    }
    res.json({
        hostname: hostname,
        requestCtr: reqcounter,
        count: req.params.count,
        numbers: numbers
    });
});

router.get('/readall', function(req, res, next) {
    reqcounter++;

    //console.log("Config: min="+min+", max="+max+", num="+num);
    findAllDocuments(docs => {
        res.json(docs);
    });
});

router.get('/readlast', function(req, res, next) {
    reqcounter++;

    //console.log("Config: min="+min+", max="+max+", num="+num);
    findLastDoc(docs => {
        res.json(docs);
    });
});

function doSort(count){
    let numbers = [];

    for(let i=0;i<count;i++){
        numbers.push(randomNumber(0,1000));
    }
    numbers.sort(compareNumber);
    //console.log(numbers);
    return numbers;
}

function insertDocument(numbers){
    mongo.open(function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('sort');
        collection.insertOne({
            _id: hostname+":"+insertcounter,
            list: numbers
        }, function(err, res){
            assert.equal(err,null);
            console.log("Inserted sucessfully");
            insertcounter++;
            db.close();
        });
    });
}

function findAllDocuments(callback){
    mongo.open(function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('sort');
        collection.find({}).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(docs);
            db.close();
            callback(docs);
        });
    });
}

function findLastDoc(callback){
    mongo.open(function(err, db) {
        assert.equal(null, err);
        var collection = db.collection('sort');
        let queryObj = {
            _id: hostname + ":" + (insertcounter-1)
        };
        console.log("find doc: "+queryObj._id);
        collection.find(queryObj).toArray(function(err, docs) {
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(docs);
            db.close();
            callback(docs);
        });
    });
}

function getDatabaseConnection(callback){
    MongoClient.connect(dbUrl, function(err, db) {
        assert.equal(null, err);
        db.dropDatabase();
        console.log("Dropped sortdb");
        MongoClient.connect(dbUrl, function(err, db) {
            assert.equal(null, err);
            console.log("Connected successfully to mongodb");
            db.close();
            callback(db);
        });
    });
}

async function setupTable(){
    sortTable = new TableStorage(hostname+"");
    console.log("Hostname for table: "+hostname);
    await sortTable.createTableIfNotExists();
}

function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

function setHostname(){
    exec('hostname', function (error, stdOut, stdErr) {
        hostname = stdOut.trim();
        console.log("Hostname set to: "+stdOut);
    });
}
module.exports = router;
