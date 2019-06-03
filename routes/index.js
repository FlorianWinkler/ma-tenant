const express = require('express');
const router = express.Router();
const util = require('../src/util');

router.get('/', function(req, res, next) {
  res.send('Monolith Service running!');
});

router.get('/preparedb', function(req, res, next) {
  util.prepareDatabase();
  res.send('Populating monolithic DB...');
});

router.get('/getconfig', function(req, res, next) {
    res.json({
        hostname: util.getHostname(),
        numPopulateItems: util.numPopulateItems
    });
});

module.exports = router;
