'use strict';
const fs = require('fs');

module.exports = async () => {
  const result=[],
        fileVal=fs.readFileSync('/etc/passwd', 'utf8').split('\n');
  fileVal.forEach((item, i) => {
      const user=item.split(':');
      if ((+user[2]>=1000) & (user[0]!=="nobody")) {
          result.push({
            value:+user[2],
            label:user[0]
          })
      }
  });
  return result;
};
