'use strict';
const screenshot = require('desktop-screenshot');;

module.exports = async (user,value) => {
  const getScreen=()=>{
    return new Promise((resolve, reject) => {
      screenshot("screenshot.png", function(error, complete) {
        if(error) {
          console.log("Screenshot failed", error);
          resolve(false);
        }
        else {
          console.log("Screenshot succeeded");
          resolve(true);
        }
      });  
    });
  }
  const screen=await getScreen();
  if (!screen) {
    return {res:false};
  }
  else {
    //получаем base64
    return {res:true};
  }  
};


