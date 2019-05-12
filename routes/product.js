require('dotenv').config();
const express = require('express');
const router = express.Router();
const assert = require("assert");
const Product = require('../src/Product');
const util = require('../src/util');

const collectionName="product";

let reqcounter = 0;
let nextProductId = 0;

router.post('/edit/:id', function(req, res) {
    reqcounter++;

    let product = new Product(req.body.name,req.body.description, req.body.price,req.body.type);

    upsertProduct(req.params.id, product, function (upsertedProduct) {
        res.json(upsertedProduct);
    });
});

router.post('/get/:id', function(req, res) {
    reqcounter++;
    findProductById(req.params.id, function(dbResponse){
        if(dbResponse != null ){
            res.json(dbResponse);
        }
        else{
            res.status(404).end();
        }
    });
});

function upsertProduct(id, product, callback){
    util.getDatabaseCollection(collectionName,function (collection) {
            collection.updateOne(
                {_id: id},
                {$set: {product: product}},
                {upsert: true},
                function (err, res) {
                if(err != null && err.code === 11000){
                    //conn.close();
                    //console.log(err);
                    //console.log("Caught duplicate Key error while writing document! Retry...");
                    setTimeout(upsertProduct,100,product);
               }
                else {
                    assert.equal(err, null);
                    // nextProductId++;
                    callback({
                       _id: id,
                       product: product
                    });
               }
            });
        });
}

function findProductById(id, callback) {
    util.getDatabaseCollection(collectionName,(async function (collection) {
        let retProduct = await collection.findOne({"_id": id});
        //console.log(retUser);
        callback(retProduct);
    }));
}


module.exports = router;
