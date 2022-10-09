'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (user,value) => {
  const pathRoot=path.dirname(path.dirname(__dirname)),
        dirLims=path.join(pathRoot,'data','lims'),
        dir=path.join(dirLims,user+'.json');
  try {
      if (!fs.existsSync(dirLims)) {
        fs.mkdirSync(dirLims, { recursive: true });
      }
      fs.writeFileSync(dir,JSON.stringify(value));
  } catch (err) {
    console.log(err);
    return {res:false};
  }
  return {res:true};
};
