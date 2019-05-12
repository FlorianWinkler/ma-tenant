require('dotenv').config();
const express = require('express');
const router = express.Router();
const assert = require("assert");
const User = require('../src/User');
const util = require('../src/util');

let reqcounter = 0;
let nextUserId = 1000;


router.post('/register', function(req, res) {
    reqcounter++;
    let user = new User(req.body.username,req.body.email,req.body.password);

    findUserByUsername(user.username,function(dbResponse){

        if(dbResponse == null){
            if(checkUserRequirements(user)){
                insertUser(user,function(insertedUser){
                    res.json(insertedUser);
                });
            }
            else{
                res.status(412).end();
            }
        }
        else{
            res.status(418).end();
        }
    });
});

router.post('/login', function(req, res) {
    reqcounter++;
    findUserByUsername(req.body.username, function(dbResponse){
        if(dbResponse != null && checkUserCredentials(dbResponse.user,req.body.username,req.body.password)){
            res.status(200).end();
        }
        else{
            console.log(dbResponse);
            res.status(401).end();
        }
    });
});

router.get('/get/:id', function(req, res) {
    reqcounter++;
    findUserById(req.params.id, function(dbResponse){
        if(dbResponse != null ){
            res.json(dbResponse);
        }
        else{
            res.status(404).end();
        }
    });
});

function insertUser(user,callback){
    util.getDatabaseCollection(util.userCollectionName,function (collection) {
            collection.insertOne({
                _id: nextUserId+"",
                user: user
            }, function (err, res) {
                if(err != null && err.code === 11000){
                    //conn.close();
                    //console.log(err);
                    console.log("Caught duplicate Key error while writing document! Retry...");
                    setTimeout(insertUser,100,user,callback);
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


function findUserByUsername(username, callback) {
    util.getDatabaseCollection(util.userCollectionName,(async function (collection) {
        let retUser = await collection.findOne({"user.username": username});
        //console.log(retUser);
        callback(retUser);
    }));
}

function findUserById(id, callback) {
    util.getDatabaseCollection(util.userCollectionName,(async function (collection) {
        let retUser = await collection.findOne({"_id": id});
        console.log(retUser);
        callback(retUser);
    }));
}

function checkUserCredentials(user, username, password){
    return user.username === username && user.password === password;
}

function checkUserRequirements(user){
    return user.password.length > 5 && user.email.includes("@") && user.email.includes(".");
}


module.exports = router;
