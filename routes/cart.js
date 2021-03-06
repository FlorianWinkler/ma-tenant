require('dotenv').config();
const express = require('express');
const router = express.Router();
const assert = require("assert");
const Cart = require('../src/Cart');
const cartItem = require("../src/CartItem");
const util = require('../src/util');

let reqcounter = 0;

router.post('/add', function(req, res) {
    reqcounter++;
    let randomUser = Math.floor((Math.random() * util.numPopulateItems-1)).toString();
    let randomProduct = Math.floor((Math.random() * util.numPopulateItems-1)).toString();
    let randomQty = Math.floor((Math.random() * 5));

    addProduct(randomUser, randomProduct, randomQty, function (upsertedCart,err) {
        if(err !== true) {
            res.json(upsertedCart);
        }
        else{
            res.status(400).end();
        }
    });
});

router.get('/get', function(req, res) {
    reqcounter++;
    let random = Math.floor((Math.random() * util.numPopulateItems-1)).toString();
    getCartByUserId(random, function(dbResponse){
        if(dbResponse != null ){
            res.json(dbResponse.cart);
        }
        else{
            res.status(400).end();
        }
    });
});

// router.get('/get', function(req, res) {
//     reqcounter++;
//     getAllCarts(function(dbResponse){
//         if(dbResponse != null ){
//             res.json(dbResponse);
//         }
//         else{
//             res.status(400).end();
//         }
//     });
// });

function addProduct(userId, productId, qty, callback) {

    let validUser=false;
    let validProduct=false;

    util.getDatabaseCollection(util.userCollectionName, async function (collection) {

        //first check if the User ID is of a valid User
        let user = await collection.findOne({"_id": userId});
        // console.log("ID: "+userId);
        // console.log("User: "+user);
        if (user != null) {
            validUser = true;
            // console.log("Valid User:" + user);

            //Check if the Product ID is from a valid Product
            util.getDatabaseCollection(util.productCollectionName, async function (collection) {
                let product = await collection.findOne({_id: productId});
                if (product != null) {
                    validProduct = true;
                    // console.log("Valid Product" + product);

                    //if User ID and Product ID are valid, insert the product to the shopping-cart
                    util.getDatabaseCollection(util.cartCollectionName, function (collection) {
                        let sci = new cartItem(productId, qty);
                        collection.updateOne(
                            {"cart.userId": userId},
                            {
                                $set: {"cart.userId": userId},
                                $addToSet: {"cart.items": sci}
                            },
                            {upsert: true},
                            function (err, res) {
                                if (err != null && err.code === 11000) {
                                    //conn.close();
                                    //console.log(err);
                                    console.log("Caught duplicate Key error while writing document! Retry...");
                                    setTimeout(addProduct, 100, userId, productId, qty, callback);
                                } else {
                                    assert.equal(err, null);
                                    // nextProductId++;
                                    callback({
                                        userId: userId,
                                        addedItem: sci
                                    });
                                }
                            });
                    });
                }
                else{
                    callback(null,true);
                }
            });
        }
        else{
            callback(null,true);
        }
    });
}

function getCartByUserId(userId, callback) {
    util.getDatabaseCollection(util.cartCollectionName,(async function (collection) {
        let retCart = await collection.findOne({"cart.userId": userId});
        //console.log(retUser);
        callback(retCart);
    }));
}

// function getAllCarts(callback) {
//     util.getDatabaseCollection(util.cartCollectionName,(async function (collection) {
//         collection.find({}).toArray(function (err, docs) {
//             assert.equal(err, null);
//             // console.log("Found the following records");
//             // console.log(docs);
//             callback(docs);
//         });
//     }));
// }


module.exports = router;
