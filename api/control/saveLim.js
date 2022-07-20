'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (user,value) => {
  const pathRoot=path.dirname(path.dirname(__dirname)),
        dir=path.join(pathRoot,'data','lims',user+'.json');
  try {
      fs.writeFileSync(dir,JSON.stringify(value))
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
};
