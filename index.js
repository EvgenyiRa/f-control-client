#!/usr/bin/node
'use strict';
const configs=require('./configs/configs.js'),
      //common=require('./services/common.js'),
      http = require('http'),
      path = require('path'),
      fs = require('fs'),
      wss=require('./services/webSocket.js'),
      routerChFC=require('./services/routerChFC.js'),
      //routerAuth = require('./services/routerAuth.js'),
      lurl=require('url'),
      { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      dfns=require('date-fns'),
      webSocketClient=require('./services/webSocketClient.js'),
      hereDateTime=new Date(),
      hereDateStr=dfns.format(hereDateTime, 'dd-MM-yyyy'),
      activeWindow = require('active-win'),
      ps = require('ps-node');

console.log("Start f-control ");

const api = new Map();

const apiPath = 'api';

const cacheFile = (filePath) => {
  if (filePath[0]!=='.') {
    filePath='.'+path.sep+filePath;
  }
  const stateF=fs.statSync(filePath);
  //console.log('filePath',filePath);
  if (!stateF.isDirectory()) {
    const key=calcKey(filePath);
    //console.log('key',key);
    try {
      const libPath = require.resolve(filePath);
      delete require.cache[libPath];
    } catch (e) {
      console.error(e);
      return;
    }
    try {
      const method = require(filePath);
      api.set(key, method);
    } catch (e) {
      console.error(e);
      api.delete(key);
    }
  }
  else {
    watch(filePath);
    cacheFolder(filePath);
  }
};

const cacheFolder = (pathIn) => {
  const files=fs.readdirSync(pathIn);
  for (var i = 0; i < files.length; i++) {
    cacheFile(path.join(pathIn,files[i]));
  }
};

const calcKey=(pathIn)=>{
  return pathIn.split(apiPath+path.sep)[1]
               .split('.')[0]
               .split(path.sep)
               .join('.');
}

const watch = (pathIn) => {
  fs.watch(pathIn, (event, file) => {
    console.log(event);
    const pathNew=path.join(pathIn,file);
    const delApi=()=>{
      //console.log('file',file);
      //console.log('file.length',file.length);
      if (file.indexOf('.js')>-1) {
        const key=calcKey(pathNew);
        api.delete(key);
      }
      else {
        for (let key of api.keys()) {
          if (key.indexOf(file+'.')===0) {
              api.delete(key);
          }
          else if (key.indexOf('.'+file+'.')>-1) {
              api.delete(key);
          }
        }
      }
    }
    if (event==='rename') {
      if (fs.existsSync(pathNew)) {
          cacheFile(pathNew);
      }
      else {
          delApi();
      }
      console.dir({ api });
    }
    else if (event==='change') {
      if (fs.existsSync(pathNew)) {
          cacheFile(pathNew);
      }
      else {
          delApi();
      }
      console.dir({ api });
    }
    else {
        cacheFile(pathNew);
    }
  });
};

cacheFolder(apiPath);
watch('.'+path.sep+apiPath+path.sep);

console.log('Initializing functions');
console.dir({ api });

console.log('Initializing web server module');
const sockets = new Set();
const server = http.createServer(async (req, res) => {
  const url = req.url === '/' ? '/index.html' : req.url;
  //console.log('req',req);
  try {
    if (url.indexOf('/ch_fc/')>-1) {
      req.router='/ch_fc';
      routerChFC(req,res);
    }
    else {
      const path = `./react-olap/build/${url.substring(1)}`;
      console.log('path',path);
      const data = fs.readFileSync(path);
      res.end(data);
    }
  } catch (err) {
    res.statusCode = 404;
    res.end('"File is not found"');
  }
}).listen(configs.webClientPort,configs.webClientIP)
  .on('listening', async () => {
      console.log(`Web server listening on ${configs.webClientIP}:${configs.webClientPort}`);
    })
  .on('error', err => {
    console.error(err);
  })
  .on('upgrade', async function upgrade(request, socket, head) {
      //console.log(request);
      const [first] = request.url.substring(1).split('/');
      if (first === 'api') {
        try {
          const ip=request.connection.remoteAddress;
          //console.log('ip',ip);
          //проверяем ip на нахождение в блокировке
          if (request.connection.remoteAddress!=='127.0.0.1') {
              socket.destroy();
              console.log('Недопустимое подключение по вебсокету');
          }
          else {
            console.log('Новый пользователь '+ip);
            request.ip=ip;
            sockets.add(socket);
            wss.handleUpgrade(request, socket, head, function done(ws) {
              wss.emit('connection', ws, request, socket, api);
            });
          }
        } catch (err) {
          console.error(err);
          socket.destroy();
        }
      } else {
        socket.destroy();
      }
  })
  .setTimeout(700000);

async function shutdown(e) {
  function closeServer() {
    return new Promise((resolve, reject) => {
      //redis.client.disconnect();
      for(let socket of sockets) {
        socket.destroy();
      }
      server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
  let err = e;
  console.log('Shutting down');
  try {
    console.log('Closing web server module');
    await closeServer();
  } catch (e) {
    console.log('Encountered error', e);
    err = err || e;
  }

  console.log('Exiting process');

  if (err) {
    process.exit(1); // Non-zero failure code
  } else {
    process.exit(0);
  }
}
module.exports.shutdown=shutdown;

process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('Received SIGINT');
  shutdown();
});


//периодическое сохранение данных в файл
//и отправка на сервер по вебсокету
const getCurrenUser=()=>{
  const result=execSync('whoami').toString().slice(0, -1);
  //если есть ещё авторизованные пользователи, то убиваем процессы текущего пользователя
  //(переделал на уровень демона для эффективного разграничения контроля)
  //чтобы если произошла смена пользователя вызвать перезапуск демоном скрипта запуска юнита
  //для корректной установки пользователя
  /*const usersActive=execSync('who').toString().slice(0, -1).split(String.fromCharCode(10));
  if (usersActive.length>1) {
      console.log("killall -w -u "+result);
      execSync("killall -w -u "+result);
  }
  const resE=execSync('last -1').toString();
  let result=resE[0];
  for (var i = 1; i < resE.length; i++) {
    if (resE[i]!==' ') {
        result+=resE[i];
    }
    else {
      break;
    }
  }*/
  return result;
}

let currentUser=getCurrenUser();
const dataDefault={
        data:{timeAll:0,access:true},
        lims:{},
        repUserId:configs.repUserId,
        key:configs.keyForWebServer,
        login:currentUser,
        wsStat:{auth:false,connect:false,dataUpdate:false}
      };
let data=dataDefault;

console.log('Current user: ',currentUser);

let lastDate=hereDateStr,
   timeAllDelta=performance.now(),
   countMSsaveTek=0;

 const loadDataLocal=()=>{
   //подгружаем данные из локальных файлов
   try {
     const dataStr=fs.readFileSync("./data/data_"+currentUser+'_'+hereDateStr+".json",
                                   {encoding:'utf8', flag:'r'});
     data.data=JSON.parse(dataStr);
   } catch (e) {
       //console.log(e);
   }
   try {
     const dataStr=fs.readFileSync("./data/lims_"+currentUser+".json",
                                   {encoding:'utf8', flag:'r'});
     data.lims=JSON.parse(dataStr);
   } catch (e) {
       //console.log(e);
   }
 }

 const dataToFilePost=async (hereDateStrIn)=>{
     try {
         if ((data.wsStat.auth) & (data.wsStat.connect)) {
           const dataSend={...data};
           dataSend.wsStat={...dataSend.wsStat};
           delete dataSend.wsStat.connection;
           const dataForWSS={type:'dataUpdate',data:dataSend, date: hereDateStrIn};
           data.wsStat.connection.sendUTF(JSON.stringify(dataForWSS));
         }
         else if ((!data.wsStat.connect) & (!!configs.webServerIP) && (!!configs.repUserId) && (!!configs.keyForWebServer)) {
             webSocketClient.init(data);
         }
     } catch (err) {
       console.log(err);
     } finally {
       try {
         fs.writeFileSync("./data/data_"+currentUser+'_'+hereDateStrIn+".json", JSON.stringify(data.data));
       } catch (err) {
         console.log(err);
       }
     }
 }

 if ((!!configs.adminLogin) && (!!configs.adminPwd)) {
   loadDataLocal();
   if ((!!configs.webServerIP) && (!!configs.repUserId) && (!!configs.keyForWebServer)) {
     //если не первый запуск/запуск до настроек
     webSocketClient.init(data);
   }
   //интервальная обработка:
   //1)активности окон пользователя
   //2)периодическое сохранение данных в файл и их отправка на сервер по вебсокету
   const timerId = setInterval(async ()=> {
     try {
       const hereDateTimeNew=new Date(),
             hereDateStrNew=dfns.format(hereDateTimeNew, 'dd-MM-yyyy');
       if (hereDateStrNew!==lastDate) {
           await dataToFilePost(lastDate);
           data.data={};
           lastDate=hereDateStrNew;
       }
       const currentUserNew=getCurrenUser();
       /*if ((currentUserNew!==currentUser) & (currentUserNew!='') & (currentUserNew!='reboot')) {
           //убиваем все процессы пользователя: выход плюс перезапуск скрипта исполнения демоном
           execSync("killall -w -u "+currentUser);
           currentUser=currentUserNew;
           console.log('New User: ',currentUser);
           data=dataDefault;
           data.login=currentUser;
           webSocketClient.wsAbort();
           loadDataLocal();
           webSocketClient.init(data);
       }*/

       //получаем активное окно и время выполнения процесса
       try {
         //new arch
         const winObj=await activeWindow(),
               winPNAMEstring=winObj.owner.name,
               winPIDstring=winObj.owner.processId;
         //console.log('processInfo',processInfo);
         winObj.time=performance.now();
         //fs.writeFileSync("./data/lastWin_"+hereDateStr+".json", JSON.stringify(winObj));
         data.data.lastWin=winObj;
         //суммируем время активных окон
         let winsActiveSumObj;
         //console.log(winsActiveSumStr);
         const timeAllDelta2=performance.now();
         if (!!data.data['winsActiveSum']) {
             winsActiveSumObj=data.data['winsActiveSum'];
             //console.log('from file');
             if (!!winsActiveSumObj[winPNAMEstring]) {
                 let timeAllF=winsActiveSumObj[winPNAMEstring]['timeAll'];
                 const winTimeAllDelta=winsActiveSumObj[winPNAMEstring]['timeAllDelta']+(timeAllDelta2-timeAllDelta);
                 winsActiveSumObj[winPNAMEstring]={timeAll:timeAllF,timeAllDelta:winTimeAllDelta,pid:+winPIDstring,access:winsActiveSumObj[winPNAMEstring]['access']};
             }
             else {
                 winsActiveSumObj[winPNAMEstring]={timeAll:0,timeAllDelta:(timeAllDelta2-timeAllDelta),pid:+winPIDstring,access:true};
             }
         }
         else {
             winsActiveSumObj={};
             winsActiveSumObj[winPNAMEstring]={timeAll:0,timeAllDelta:(timeAllDelta2-timeAllDelta),pid:+winPIDstring,access:true};
         }
         data.data['winsActiveSum']=winsActiveSumObj;

         if (['chrome'].indexOf(winPNAMEstring)>-1) {
           //добавляем время к последнему активному хосту, если это процесс браузера
           //и существуют данные о последнем переходе на страницу
           if (!!data.data.browserLastHost) {
               data.data.browser[data.data.browserLastHost].timeAll+=timeAllDelta2-timeAllDelta;
           }
         }

         data.data['timeAll']+=timeAllDelta2-timeAllDelta;
         countMSsaveTek+=timeAllDelta2-timeAllDelta;
         if (countMSsaveTek>=configs.countMSsave) {
             countMSsaveTek=0;
             await dataToFilePost(lastDate);
             //console.log(data);
             //await dataToFilePost(lastDate);
         }

         //проверяем превышение лимитов
         if (!!data.lims) {
           let rows=data.lims.sys;
           if (!!rows) {
             const timeAllClient=data.data.timeAll/1000;
             data.data.access=true;
             if (rows['TIME_ALL']>0) {
               if (rows['TIME_ALL']<timeAllClient) {
                 data.data.access=false;
               }
             }
             if (!!data.lims.proc) {
               rows=data.lims.proc;
               if (rows.length>0) {
                 //console.log(data.winsActiveSum);
                 for (var i = 0; i < rows.length; i++) {
                   const rowOne=rows[i];
                   if (!!data.data.winsActiveSum[rowOne['PRC_NAME']]) {
                     const timeAllDeltaClient=data.data.winsActiveSum[rowOne['PRC_NAME']].timeAllDelta/1000;
                     data.data.winsActiveSum[rowOne['PRC_NAME']].access=true;
                     if (rowOne['LIM']<timeAllDeltaClient) {
                         data.data.winsActiveSum[rowOne['PRC_NAME']].access=false;
                     }
                   }
                 }
               }
             }
           }
           else {
              data.data.access=true;
           }
         }
         else {
           data.data.access=true;
         }

         if (!data.data.access) {
           if (configs.test) {
             console.log("killall -w -u "+currentUser);
           }
           else {
             //execSync("gnome-session-quit --logout --no-prompt");
             try {
               execSync("killall -w -u "+currentUser);
             } catch (e) {
               console.error(e); // should contain code (exit code) and signal (that caused the termination).
             }
           }
         }
         //убиваем запрещенные процессы
         for (var key in data.data.winsActiveSum) {
             const oneWin=data.data.winsActiveSum[key];
             if (!oneWin.access) {
                 try {
                   execSync("kill -TERM "+oneWin.pid);
                 } catch (e) {
                   //console.error(e); // should contain code (exit code) and signal (that caused the termination).
                 }
             }
         }
         timeAllDelta=timeAllDelta2;
       } catch (e) {
         console.error(e); // should contain code (exit code) and signal (that caused the termination).
       }
       //fs.writeFileSync("./data/lastWin.json", JSON.stringify({time:performance.now()}));
     } catch (e) {
       console.error(e); // should contain code (exit code) and signal (that caused the termination).
     }
   },configs.countMSupd);
 }
