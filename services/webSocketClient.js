// Создаётся экземпляр клиента
'use strict';
const configs=require('../configs/configs.js'),
      W3CWebSocket = require('websocket').w3cwebsocket,
      { performance } = require('perf_hooks');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const api={},
      apiStr={};
let wsClient;
const init=(data)=> {
  return new Promise((resolve) => {
    const wsStat={
      connect:false,
      auth:false,
      keyAuth:undefined
    };
    const resolveObj={};

    console.log("Подключение к серверу "+configs.webServer+" по WebSocket");
    wsClient = new W3CWebSocket(configs.webSocketServer+'/api', 'echo-protocol');

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
              type:'authClient',
              message:"it's my, open!",
              webServerLogin:data.webServerLogin,
              webServerPwd:data.webServerPwd,
              login:data.login
            };
            wsSend(JSON.stringify(request));
        }
        else if (dataP.type==='authRes') {
          wsStat.auth=dataP.data.auth;
          console.log('Auth result',dataP.data);
          if (wsStat.auth) {
            wsStat.keyAuth=dataP.data.key;
            wsStat.user=dataP.data.user;
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
                            id:id,
                            keyAuth:wsStat.keyAuth
                          }));
                        }
                        if ((wsStat.auth) & (wsStat.connect)) {
                          if(wsClient.readyState!== wsClient.OPEN){
                              setTimeout(function (){
                                  if(wsClient.readyState!== wsClient.OPEN){
                                      wsStat.connect=false;
                                      wsClient.close();
                                      init(wsStat.keyAuth,true).then((resWsCon) => {
                                        if (resWsCon) {
                                            getMethod();
                                        }
                                        else {
                                            resolve2(false);
                                        }
                                      })
                                  }
                                  else {
                                      getMethod();
                                  }
                              },3000);
                          } else {
                              getMethod();
                          }
                        }
                        else if (!wsStat.connect) {
                            init(wsStat.keyAuth,true).then((resWsCon) => {
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
            resolve(wsStat);
          }
          else {
            resolve(wsStat);
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
        resolve(wsStat);
    };

    wsClient.onerror = function(error) {
        console.log("Ошибка " + error.message);
        wsStat.connect=false;
        resolve(wsStat);
    };

    const wsSend = (data)=> {
      // readyState - true, если есть подключение
      wsClient.send(data);
    }
  });
}

const wsClose=()=>{
    if (!!wsClient) {
      wsClient.close();
    }
}

export {init,wsClose,api,apiStr};
