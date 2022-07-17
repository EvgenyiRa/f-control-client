'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (user,date) => {
  if ((!!user) & (!!date)) {
    const pathRoot=path.dirname(path.dirname(__dirname)),
          dir=path.join(pathRoot,'data','data_'+user+'_'+date+'.json'),
          result=JSON.parse(fs.readFileSync(dir, 'utf8'));;
    return result;
  }
};
