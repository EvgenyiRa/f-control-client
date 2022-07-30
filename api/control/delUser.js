'use strict';
const path = require('path'),
      fs = require('fs');

module.exports = async (user) => {
  const result={delOk:true};
  try {
    const pathRoot=path.dirname(path.dirname(__dirname)),
          dirData=path.join(pathRoot,'data'),
          dirLim=path.join(dirData,'lims',user+'.json'),
          files=fs.readdirSync(dirData);
    fs.unlinkSync(dirLim);
    for (var i = 0; i < files.length; i++) {
      const dirF=path.join(dirData,files[i]),
            stateF=fs.statSync(dirF);
      //console.log('filePath',filePath);
      if ((!stateF.isDirectory()) & (files[i].indexOf('data_'+user+'_')>-1))  {
          fs.unlinkSync(dirF);
      }
    }
  } catch (err) {
    if (!!err.stderr) {
      result.text=err.stderr.toString();
    }
    else if (!!err.message) {
      result.text=err.message;
    }
    else {
        result.text='Неопознанная ошибка'
    }
    result.delOk=false;
  }
  return result;
};
