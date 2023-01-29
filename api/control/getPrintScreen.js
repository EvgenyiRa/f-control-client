'use strict';
const { spawn } = require('child_process'),
      fs = require('fs');

module.exports = async (user,value) => {
  const result={res:false},
        pathScreen='/tmp/screenshot.png';
  const getScreen=()=>{
    return new Promise((resolve, reject) => {
      const child = spawn('scrot',['-o',pathScreen]);
      child.on('close', (code) => {
        if (code !== 0) {
          resolve(false); 
          console.log(`grep process exited with code ${code}`);
        }
        else {
          resolve(true);
        }
      });  
    });
  }
  try {
    const screen=await getScreen();
    if (screen) {    
      //получаем base64
      const bitmap = fs.readFileSync(pathScreen);
      // convert binary data to base64 encoded string
      result.res=Buffer.from(bitmap).toString('base64');
    }
  } catch (err) {
    console.log(err);
  }
  return result;
};


