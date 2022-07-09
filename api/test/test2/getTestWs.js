'use strict';

module.exports =()=> {
  const delay=2000;
  return new Promise((resolve) => {
    setTimeout(()=>{
        resolve('delay='+delay);
    }, delay);
  });
};
