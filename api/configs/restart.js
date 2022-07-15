'use strict';
const execSync = require('child_process').execSync,
      path = require('path'),
      index=require('../../index.js');

module.exports = async () => {
  let result=true;
  try {
    index.shutdown();
    const nodeD=execSync('which node').toString().slice(0, -1),
          dirS=path.join(path.dirname(path.dirname(__dirname)),'index.js');;
    execSync('exec  '+nodeD+' '+dirS);
  } catch (err) {
    console.log(err);
    result=false;
  }
  return result;
};
