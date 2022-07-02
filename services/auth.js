const configs=require('../configs/configs.js');

module.exports.set=(val)=>{
  let result=false;
  if ((typeof configs.adminLogin==='undefined')
      & (typeof configs.adminPwd==='undefined')) {
          result=true;
  }
  return result;
};
