'use strict';

module.exports =()=> {
  const delay=10;
  return new Promise((resolve) => {
    setTimeout(()=>{
        resolve('delay='+delay);
    }, delay);
  });
};
