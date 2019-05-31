const exec = require('child_process').exec;
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const User = require("../src/User");
const Product = require("../src/Product");
const Cart = require("./Cart");
const CartItem = require("./CartItem");

const dbUrl = "mongodb://127.0.0.1:27017/monolithdb";
// const dbUrl = "mongodb://10.0.0.206:27017/monolithdb";
const cartCollectionName="cart";
const userCollectionName="user";
const productCollectionName="product";

const numPopulateItems = 1000;

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
            populateDB();
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

function populateDB() {
    let userCollection;
    let nextUserId = 0;
    let productCollection;
    let nextProductId = 0;
    let cartCollection;
    let nextCartUserId=0;

//--------insert Users--------
    getDatabaseCollection(userCollectionName, function (collection) {
            userCollection = collection;
            insertNextUser();
        }
    );

    function insertNextUser() {
        if (nextUserId < numPopulateItems) {
            let user = new User("User" + nextUserId, "user" + nextUserId + "@test.at", "user" + nextUserId);
            userCollection.insertOne({
                _id: nextUserId.toString(),
                user: user
            }, function (err, res) {
                nextUserId++;
                insertNextUser();
            });
        } else {
            console.log("Users inserted");
        }
    }

//--------insert Products--------
    getDatabaseCollection(productCollectionName, function (collection) {
        productCollection = collection;
        insertNextProduct()
    });

    function insertNextProduct() {
        if (nextProductId < numPopulateItems) {
            productCollection.updateOne(
                {_id: nextProductId.toString()},
                {$set: {product: (new Product("Product" + nextProductId, "Product" + nextProductId, nextProductId, Math.floor((Math.random() * 10) + 1)))}},
                {upsert: true},
                function (err, res) {
                    nextProductId++;
                    insertNextProduct();
                });
        } else {
            console.log("Products inserted");
        }
    }

//--------insert Shopping Carts--------
    getDatabaseCollection(cartCollectionName, function (collection) {
        cartCollection = collection;
        insertNextCart()
    });

    function insertNextCart(){
        if(nextCartUserId < numPopulateItems){
            let randomProduct = Math.floor((Math.random() * numPopulateItems-1)).toString();
            let randomQty = Math.floor((Math.random() * 10));
            let cartItem = new CartItem(randomProduct,randomQty);
            let cart = new Cart(nextCartUserId.toString(),[cartItem]);
            cartCollection.insertOne({
                cart: cart
            }, function (err, res) {
                nextCartUserId++;
                insertNextCart();
            });
        }else{
            console.log("Shopping Carts inserted");
        }
    }
}


module.exports = {
    getDatabaseConnection: getDatabaseConnection,
    getDatabaseCollection: getDatabaseCollection,
    prepareDatabase: prepareDatabase,
    setHostname: setHostname,
    getHostname: getHostname,
    cartCollectionName: cartCollectionName,
    userCollectionName: userCollectionName,
    productCollectionName: productCollectionName,
    numPopulateItems: numPopulateItems
};
