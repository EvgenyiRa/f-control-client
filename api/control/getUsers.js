'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (codeCity) => {
  const pathRoot=path.dirname(path.dirname(__dirname)),
        dir=path.join('data','lims'),
        files=fs.readdirSync(dir),
        result=[];
  for (var i = 0; i < files.length; i++) {
    const dirF=path.join(dir,files[i]),
          name=files[i].split('.json')[0];
    result.push({value:name,label:name});
  }
  return result;
};
