'use strict';
import {getDataServer} from './system.js';

const api={};
let wsClient;
const init=()=> {
  return new Promise((resolve) => {
  const wsStat={
    connect:false,
    auth:false
  };

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
            message:"it's my, open!"/*,
            key:configs.webServerConfigs.key*/
          };
          wsSend(JSON.stringify(request));
      }
      else if (dataP.type==='authRes') {
        wsStat.auth=dataP.data.auth;
        console.log('Auth result',dataP.data);
        if (wsStat.auth) {
          for (const method of dataP.data.methods) {
            api[method] = (...args) => new Promise((resolve2) => {
              const getMethod=()=>{
                wsSend(JSON.stringify({
                  type:"method",
                  method:method,
                  args:args
                }));
                wsClient.onmessage = (event2) => {
                  //console.log('apiEvent',event);
                  const result = JSON.parse(event2.data);
                  resolve2(result.data);
                };
              }
              if ((wsStat.auth) & (wsStat.connect)) {
                  getMethod();
              }
              else if (!wsStat.connect) {
                  init().then((resWsCon) => {
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
          };
          resolve(true);
        }
        else {
          resolve(false);
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

export {init,wsClose,api};
