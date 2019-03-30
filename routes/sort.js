const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
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

    res.json(numbers);
});

function randomNumber(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
}

function compareNumber(a,b){
    return a-b;
}

module.exports = router;
