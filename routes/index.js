const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.send('NodeJS + Express läuft!');
});

router.get('/preparedb', function(req, res, next) {
  util.prepareDatabase();
  res.send('Populating monolithic DB...');
});

module.exports = router;
