const express = require('express');
const routerChFC = new express.Router();
const chFSsetUrl = require('../controllers/chFSsetUrl.js');

routerChFC.route('/set_url')
  .post(chFSsetUrl.post);

module.exports = routerChFC;
