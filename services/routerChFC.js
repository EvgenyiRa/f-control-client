const express = require('express');
const routerChFC = new express.Router();
const chFSsetUrl = require('../controllers/chFSsetUrl.js');
const chFSgetInfo = require('../controllers/chFSgetInfo.js');

routerChFC.route('/set_url')
  .post(chFSsetUrl.post);

routerChFC.route('/get_info')
  .get(chFSgetInfo.get);

module.exports = routerChFC;
