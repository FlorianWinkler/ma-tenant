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

module.exports = router;
