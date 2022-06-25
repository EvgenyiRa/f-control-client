const configs=require('../configs/configs.js');

module.exports.set=(val)=>{
  if (configs.users.indexOf(val)>-1) {
    return true;
  }
  else {
    return false;
  }
};
