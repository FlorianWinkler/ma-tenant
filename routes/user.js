require('dotenv').config();
const express = require('express');
const router = express.Router();
const assert = require("assert");
const User = require('../src/User');
const util = require('../src/util');

const collectionName="user";

let reqcounter = 0;
let nextUserId = 0;



util.setHostname();
//wait one second until mongoDB has started properly, before retrieving DB connection
setTimeout(util.prepareDatabase,1000);


router.post('/register', async function(req, res) {
    reqcounter++;

    let user = new User(req.body.username,req.body.email,req.body.password);

    insertUser(user,function(insertedUser){
        res.json(insertedUser);
    });
    // res.status(200).end();
});



function insertUser(user,callback){
    util.getDatabaseCollection(collectionName,function (collection) {
            collection.insertOne({
                _id: nextUserId,
                user: user
            }, function (err, res) {
                if(err != null && err.code === 11000){
                    //conn.close();
                    //console.log(err);
                    //console.log("Caught duplicate Key error while writing document! Retry...");
                    setTimeout(insertUser,100,user);
               }
                else {
                    assert.equal(err, null);
                    //console.log("Inserted successfully:"+res.ops[0]._id);
                    nextUserId++;
                    callback({
                       _id: res.ops[0]._id,
                       user: user
                    });
               }
            });
        });
}

function findAllDocuments(callback) {
    util.getDatabaseCollection(collectionName,(function (collection) {
        collection.find({}).toArray(function (err, docs) {
            assert.equal(err, null);
            // console.log("Found the following records");
            // console.log(docs);
            callback(docs);
        });
    }));
}



module.exports = router;
