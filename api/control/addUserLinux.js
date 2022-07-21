'use strict';
const execSync = require('child_process').execSync;

module.exports = async (pwdAdm,login,pwd) => {
  let result=true;
  try {
    //echo "pwd|sudo -S useradd test3 -p 111111 -m -U -s /bin/bash
    execSync(`useradd ${login} -p ${pwd} -m -U -s /bin/bash`);
  } catch (err) {
    console.log(err);
    result=false;
  }
  return result;
};
