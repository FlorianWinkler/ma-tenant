require('dotenv').config();
const express = require('express');
const router = express.Router();
const assert = require("assert");
const ShoppingCart = require('../src/ShoppingCart');
const ShoppingCartItem = require("../src/ShoppingCartItem");
const util = require('../src/util');

let reqcounter = 0;

router.post('/add/', function(req, res) {
    reqcounter++;
    addProduct(req.body.userId, req.body.productId, req.body.qty, function (upsertedShoppingCart,err) {
        if(err !== true) {
            res.json(upsertedShoppingCart);
        }
        else{
            res.status(400).end();
        }
    });
});

router.get('/get/:userId', function(req, res) {
    reqcounter++;
    getShoppingCartByUserId(req.params.userId, function(dbResponse){
        if(dbResponse != null ){
            res.json(dbResponse.shoppingCart);
        }
        else{
            res.status(400).end();
        }
    });
});

// router.get('/get', function(req, res) {
//     reqcounter++;
//     getAllShoppingCarts(function(dbResponse){
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
        console.log("ID: "+userId);
        console.log("User: "+user);
        if (user != null) {
            validUser = true;
            console.log("Valid User:" + user);

            //Check if the Product ID is from a valid Product
            util.getDatabaseCollection(util.productCollectionName, async function (collection) {
                let product = await collection.findOne({_id: productId});
                if (product != null) {
                    validProduct = true;
                    console.log("Valid Product" + product);

                    //if User ID and Product ID are valid, insert the product to the shopping-cart
                    util.getDatabaseCollection(util.shoppingCartCollectionName, function (collection) {
                        let sci = new ShoppingCartItem(productId, qty);
                        collection.updateOne(
                            {"shoppingCart.userId": userId},
                            {
                                $set: {"shoppingCart.userId": userId},
                                $addToSet: {"shoppingCart.items": sci}
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

function getShoppingCartByUserId(userId, callback) {
    util.getDatabaseCollection(util.shoppingCartCollectionName,(async function (collection) {
        let retShoppingCart = await collection.findOne({"shoppingCart.userId": userId});
        //console.log(retUser);
        callback(retShoppingCart);
    }));
}

// function getAllShoppingCarts(callback) {
//     util.getDatabaseCollection(util.shoppingCartCollectionName,(async function (collection) {
//         collection.find({}).toArray(function (err, docs) {
//             assert.equal(err, null);
//             // console.log("Found the following records");
//             // console.log(docs);
//             callback(docs);
//         });
//     }));
// }


module.exports = router;