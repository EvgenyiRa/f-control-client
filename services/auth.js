const configs=require('../configs/configs.js'),
      salts=require('../configs/salts.js'),
      bcrypt = require('bcryptjs');

module.exports.set=async (login,pwd)=>{
  let result=false;
  if ((typeof configs.adminLogin==='undefined')
      & (typeof configs.adminPwd==='undefined')) {
          result=true;
  }
  else {
      if ((!!login) & (!!pwd)) {
        if (login===configs.adminLogin) {
          for (var i = 0; i < salts.length; i++) {
            const oneHash=await bcrypt.hash(pwd, salts[i]);
            console.log('oneHash',oneHash);            
            //console.log("oneHash:",oneHash);test
            if (oneHash===configs.adminPwd) {
              result=true;
              break;
            }
          }
        }
      }
  }
  return result;
};
