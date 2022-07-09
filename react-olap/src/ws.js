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
  const resolveObj={};

  /*const wsOnMessg(methodIn,argsIn,resolveIn)=>{
    const getMethod=()=>{
      wsSend(JSON.stringify({
        type:"method",
        method:method,
        args:argsIn
      }));
      const onMessageWs=(eventIn)=>{
        const result = JSON.parse(eventIn.data);
        wsClient.removeEventListener('message',onMessageWs);
        resolveIn(result.data);
      }
      wsClient.addEventListener('message',onMessageWs);
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
              resolveIn(false);
          }
        })
    }
    else {
        resolveIn(false);
    }
  }*/

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

export {init,wsClose,api};
