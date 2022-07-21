'use strict';
const execSync = require('child_process').execSync;

module.exports = async (login,pwd) => {
  let result=true;
  try {    
    execSync('exec  '+nodeD+' '+dirS);
  } catch (err) {
    console.log(err);
    result=false;
  }
  return result;
};
