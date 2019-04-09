const express = require('express');
const router = express.Router();

let reqcounter = 0;

router.get('/', function(req, res, next) {
    reqcounter++;
    let min=0;
    let max=100;
    let num=100;
    //console.log("Config: min="+min+", max="+max+", num="+num);
    let numbers = [];
    for(let i=0;i<num;i++){
        numbers.push(randomNumber(min,max));
    }
    numbers.sort(compareNumber);
    //console.log(numbers);
    var child_process = require("child_process");

    res.json({
        hostname: req.headers.host,
        requestCtr: reqcounter,
        numbers: numbers
    });
});

function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

module.exports = router;
