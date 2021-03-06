'use strict';
const fs = require('fs');

module.exports = async (inParams) => {
  let users=[];
  if (Array.isArray(inParams.users)) {
    users=inParams.users
  }
  const result=[],
        fileVal=fs.readFileSync('/etc/passwd', 'utf8').split('\n'),
        fileValGroup=fs.readFileSync('/etc/group', 'utf8').split('\n'),
        groupParse={};
  fileVal.forEach((item, i) => {
      const group=item.split(':');
      groupParse[group[2]]=group[0];
  });
  fileVal.forEach((item, i) => {
      const user=item.split(':');
      if ((+user[2]>=1000) & (user[0]!=="nobody") & (users.indexOf(user[0])<0)) {
          result.push({
            UID:+user[2],
            LOGIN:user[0],
            GID:+user[3],
            GNAME:groupParse[user[3]]
          })
      }
  });
  return result;
};
