'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async () => {
  const pathRoot=path.dirname(path.dirname(__dirname)),
        dir=path.join('data','lims'),
        result={};
  if (fs.existsSync(dir)) {     
    const files=fs.readdirSync(dir);
    for (var i = 0; i < files.length; i++) {
      const dirF=path.join(dir,files[i]);
      result[files[i].split('.json')[0]]=JSON.parse(fs.readFileSync(dirF, 'utf8'));
    }
  }
  return result;
};
