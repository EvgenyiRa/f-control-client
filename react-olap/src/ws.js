'use strict';
import {getDataServer} from './system.js';

const api={},
      apiStr={};
let wsClient;
const init=(login,pwd)=> {
  return new Promise((resolve) => {
  const wsStat={
    connect:false,
    auth:false
  };
  const resolveObj={};

  console.log("Подключение к серверу "+getDataServer()+" по WebSocket");
  wsClient = new WebSocket('ws:'+getDataServer()+'/api');

  wsClient.onopen = function() {
      console.log("Соединение установлено");
      wsStat.connect=true;
  };

  wsClient.onmessage = (event) => {
    try {
      const dataP=JSON.parse(event.data);
      if (dataP.type==='auth') {
          // посылаем сообщение серверу
          const request={
            type:'auth',
            message:"it's my, open!",
            login:login,
            pwd:pwd
          };
          wsSend(JSON.stringify(request));
      }
      else if (dataP.type==='authRes') {
        wsStat.auth=dataP.data.auth;
        console.log('Auth result',dataP.data);
        if (wsStat.auth) {
          for (const method of dataP.data.methods) {
            const path=method.split('.');
            let i=0;
            const setApiTree=(apiIn,i)=>{
                if (i===(path.length-1)) {
                    apiIn[path[i]] = (...args) => new Promise((resolve2) => {
                      const getMethod=()=>{
                        const id=performance.now();
                        resolveObj[id]=resolve2;
                        wsSend(JSON.stringify({
                          type:"method",
                          method:method,
                          args:args,
                          id:id
                        }));
                      }
                      if ((wsStat.auth) & (wsStat.connect)) {
                          getMethod();
                      }
                      else if (!wsStat.connect) {
                          init(login,pwd).then((resWsCon) => {
                            if (resWsCon) {
                                getMethod();
                            }
                            else {
                                resolve2(false);
                            }
                          })
                      }
                      else {
                          resolve2(false);
                      }
                    });
                    apiStr[method]=apiIn[path[i]];
                }
                else {
                    if (!!!apiIn[path[i]]) {
                      apiIn[path[i]]={};
                    }
                    setApiTree(apiIn[path[i]],++i)
                }
            }
            setApiTree(api,i);
          };
          //console.log('apiStr',apiStr);
          resolve(true);
        }
        else {
          resolve(false);
        }
      }
      else if (dataP.type==='method') {
          if (!!resolveObj[dataP.id]) {
            resolveObj[dataP.id](dataP.data);
            delete resolveObj[dataP.id];
          }
      }
    } catch (err) {
      console.log('try wsServer err msg: ', err);
    }
  }

  wsClient.onclose = function(event) {
      if (event.wasClean) {
          console.log('Соединение закрыто чисто');
      } else {
          console.log('Обрыв соединения'); // например, "убит" процесс сервера
      }
      console.log('Код: ' + event.code + ' причина: ' + event.reason);
      wsStat.connect=false;
      resolve(false);
  };

  wsClient.onerror = function(error) {
      console.log("Ошибка " + error.message);
      wsStat.connect=false;
      resolve(false);
  };

  const wsSend = (data)=> {
    // readyState - true, если есть подключение
    if (wsStat.connect) {
      if(!wsClient.readyState){
          setTimeout(function (){
              wsSend(data);
          },100);
      } else {
          wsClient.send(data);
      }
    }
  }
});
}

const wsClose=()=>{
    wsClient.close();
}

export {init,wsClose,api,apiStr};
