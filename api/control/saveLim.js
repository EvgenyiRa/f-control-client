'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (user,value) => {
  const pathRoot=path.dirname(path.dirname(__dirname)),
        dir=path.join(pathRoot,'data','lims',user+'.json');
  try {
      fs.writeFileSync(dir,value)
  } catch (err) {
    console.log(err);
    return false;
  }  
  return true;
};
