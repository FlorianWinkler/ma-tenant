const express = require('express');
const router = express.Router();

let reqcounter = 0;

router.get('/', function(req, res, next) {
    reqcounter++;
    //console.log("Config: min="+min+", max="+max+", num="+num);

    let numbers = doSort(1000);

    res.json({
        hostname: req.headers.host,
        requestCtr: reqcounter,
        numbers: numbers
    });
});

router.get('/:count', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(req.params.count);

    res.json({
        hostname: req.headers.host,
        requestCtr: reqcounter,
        numbers: numbers
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


function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

module.exports = router;
