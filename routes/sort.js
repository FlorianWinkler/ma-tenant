require('dotenv').config();
const express = require('express');
const router = express.Router();
const exec = require('child_process').exec;
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

let reqcounter = 0;
let insertcounter = 0;
let hostname = "unknown_host";
let dbUrl = "mongodb://127.0.0.1:27017/sortdb";
//let dbUrl = "mongodb://10.0.0.85:27017/sortdb";
let mongodbConn=null;

setHostname();
setTimeout(prepareSortDatabase,1000);

router.get('/', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(1000);
    // console.log(numbers);
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

router.get('/count/:count/:numberResponse', function(req, res) {
    reqcounter++;

    let numbers = doSort(req.params.count);
    insertDocument(numbers);
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

router.get('/readall', function(req, res) {
    reqcounter++;

    //console.log("Config: min="+min+", max="+max+", num="+num);
    findAllDocuments(docs => {
        res.json(docs);
    });
});

router.get('/readlast', function(req, res) {
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
    getDatabaseConnection(function (conn) {
            var collection = conn.collection('sort');
            collection.insertOne({
                _id: hostname + ":" + insertcounter,
                list: numbers
            }, function (err, res) {
                if(err != null && err.code === 11000){
                    //conn.close();
                    //console.log(err);
                    //console.log("Caught duplicate Key error while writing document! Retry...");
                    setTimeout(insertDocument,100,numbers);
               }
                else {
                    assert.equal(err, null);
                    // console.log("Inserted sucessfully");
                    insertcounter++;
               }
            });
        });
}

function findAllDocuments(callback) {
    getDatabaseConnection(function (conn) {
        var collection = conn.collection('sort');
        collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            // console.log("Found the following records");
            // console.log(docs);
            callback(docs);
        });
    });
}

function findLastDoc(callback) {
    getDatabaseConnection(function (conn) {
        var collection = conn.collection('sort');
        let queryObj = {
            _id: hostname + ":" + (insertcounter - 1)
        };
        // console.log("find doc: " + queryObj._id);
        collection.find(queryObj).toArray(function (err, docs) {
            assert.equal(err, null);
            // console.log("Found the following records");
            // console.log(docs);
            callback(docs);
        });
    });
}

function getDatabaseConnection(callback) {
    if (mongodbConn == null) {
        MongoClient.connect(dbUrl, function (err, connection) {
            assert.equal(null, err);
            mongodbConn = connection;
            console.log("Retrieved new MongoDB Connection");
            callback(mongodbConn);
        });
    } else {
        callback(mongodbConn);
    }

}

function prepareSortDatabase() {
    getDatabaseConnection(function(connection) {
            connection.dropDatabase();
            console.log("Dropped sortdb");
            mongodbConn = connection;
        }
    );
}

function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

function setHostname(){
    exec('hostname', function (error, stdOut) {
        hostname = stdOut.trim();
        console.log("Hostname set to: "+hostname);
    });
}
module.exports = router;
