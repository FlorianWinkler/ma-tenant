const express = require('express');
const router = express.Router();
const util = require('../src/util');

router.get('/', function(req, res, next) {
  res.send('Tenant Service running!');
});

router.get('/preparedb', function(req, res, next) {
  util.prepareDatabase();
  res.send('Populating tenant DB...');
});

router.get('/getconfig', function(req, res, next) {
    res.json({
        hostname: util.getHostname(),
        numPopulateItems: util.numPopulateItems
    });
});

module.exports = router;
