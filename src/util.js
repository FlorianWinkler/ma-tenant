const exec = require('child_process').exec;
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

// const dbUrl = "mongodb://127.0.0.1:27017/monolithDB";
const dbUrl = "mongodb://10.0.0.141:27017/monolithDB";
const shoppingCartCollectionName="shoppingCart";
const userCollectionName="user";
const productCollectionName="product";

let hostname = "unknown_host";
let mongodbConn=null;

setHostname();
//wait one second until mongoDB has started properly, before retrieving DB connection
setTimeout(prepareDatabase,1000);

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

function getDatabaseCollection(collectionName, callback){
    getDatabaseConnection(function(conn){
        var collection = conn.collection(collectionName);
        callback(collection);
    })
}

function prepareDatabase() {
    getDatabaseConnection(function(connection) {
            connection.dropDatabase();
            console.log("Dropped DB");
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
function getHostname(){
    return hostname;
}

module.exports = {
    getDatabaseConnection: getDatabaseConnection,
    getDatabaseCollection: getDatabaseCollection,
    prepareDatabase: prepareDatabase,
    setHostname: setHostname,
    getHostname: getHostname,
    shoppingCartCollectionName: shoppingCartCollectionName,
    userCollectionName: userCollectionName,
    productCollectionName: productCollectionName
};
