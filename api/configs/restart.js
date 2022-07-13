'use strict';
/*const execSync = require('child_process').execSync,
      path = require('path');*/
const index=require('../../index.js');

module.exports = async () => {
  index.shutdown();
};
