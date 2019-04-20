const express = require('express');
const router = express.Router();

const exec = require('child_process').exec;

let reqcounter = 0;
let hostname = "unknown_host";
setHostname();

router.get('/', function(req, res, next) {
    reqcounter++;
    //console.log("Config: min="+min+", max="+max+", num="+num);

    let numbers = doSort(1000);

    //console.log(hostname);
    res.json({
        hostname: hostname,
        requestCtr: reqcounter,
        numbers: []
    });
});

router.get('/:count', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(req.params.count);

    res.json({
        hostname: hostname,
        requestCtr: reqcounter,
        count: req.params.count,
        numbers: []
    });
});

router.get('/:count/:numberResponse', function(req, res, next) {
    reqcounter++;

    let numbers = doSort(req.params.count);
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

function setHostname(){
    exec('hostname', function (error, stdOut, stdErr) {
        console.log(stdOut);
        hostname = stdOut;
    });
}

module.exports = router;
