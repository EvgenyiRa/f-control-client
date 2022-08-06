'use strict';
const execSync = require('child_process').execSync;

module.exports = async (pwdAdm,login,pwd) => {
  const result={addOk:true};
  try {
    //echo "pwd|sudo -S useradd test3 -p 111111 -m -U -s /bin/bash
    result.text=execSync(`echo "${pwdAdm}"|sudo -S useradd ${login} -p ${pwd} -m -U -s /bin/bash`).toString().slice(0, -1);
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
    result.addOk=false;
  }
  return result;
};
