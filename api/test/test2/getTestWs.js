'use strict';

module.exports =()=> {
  const delay=3000;
  return new Promise((resolve) => {
    setTimeout(()=>{
        resolve('delay='+delay);
    }, delay);
  });
};
