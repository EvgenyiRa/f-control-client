'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (codeCity) => {
  const dir='../../data/lims',
        files=fs.readdirSync(dir),
        result={};
  for (var i = 0; i < files.length; i++) {
    const dirF=path.join(dir,files[i]);
    result[files[i].split('.json')[0]]=JSON.parse(fs.readFileSync(dirF, 'utf8'));
  }
  return result;
};
