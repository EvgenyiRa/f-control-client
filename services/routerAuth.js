const express = require('express');
const routerAuth = new express.Router();
const authset = require('../controllers/authset.js');
const authIsFirstRun = require('../controllers/authIsFirstRun.js');

routerAuth.route('/set')
  .post(authset.post);

routerAuth.route('/is_first_run')
  .post(authIsFirstRun.post);

module.exports = routerAuth;
