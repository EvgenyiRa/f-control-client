const configs=require('../configs/configs.js'),
      common=require('./common.js'),
      routerChFC=require('./routerChFC.js'),
      routerAuth = require('./routerAuth.js'),
      lurl=require('url'),
      { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      dfns=require('date-fns'),
      webSocketClient=require('./webSocketClient.js'),
      hereDateTime=new Date(),
      hereDateStr=dfns.format(hereDateTime, 'dd-MM-yyyy'),
      express = require('express'),
      fs = require('fs'),
      path = require('path'),
      bodyParser = require('body-parser'),
      activeWindow = require('active-win'),
      ps = require('ps-node');

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
        webServerLogin:configs.webServerLogin,
        webServerPwd:configs.webServerPwd,
        login:currentUser,
        wsStat:{auth:false,connect:false,dataUpdate:false}
      };
let data=dataDefault;

console.log("Start f-control ");
console.log('Current user: ',currentUser);

let https,
   lastDate=hereDateStr,
   timeAllDelta=performance.now(),
   countMSsaveTek=0;
if (configs.https) {
    https = require('https');
}
else {
    https = require('http');
}

let httpsServer;

function initialize() {
  return new Promise((resolve, reject) => {
    const app = express()/*,
          appWs = express()*/;

    if (configs.https) {
      const serverKey=path.resolve('cert', 'server.key');
      const serverCert=path.resolve('cert', 'server.cert');
      const pathCert='/cert/server.key';
      httpsServer =https.createServer({
        key: fs.readFileSync(path.normalize(serverKey)),
        cert: fs.readFileSync(path.normalize(serverCert))
      }, app);
    }
    else {
        httpsServer = https.createServer(app);
        //httpWsServer = httpWs.createServer(appWs);
    }

    app.use(bodyParser.json({limit: '100mb', extended: true}));

    app.use('/',express.static(path.dirname(__dirname)+'/react-olap/build'));

    app.all('*', function(req, res, next) {
        const ip=common.getIP(req);
        if (ip==='127.0.0.1') {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            req.body.data=data;
            next();
        }
        else {
          res.status(404).end();
        }
    });

    app.use('/ch_fc', routerChFC);
    app.use('/auth', routerAuth);

    httpsServer.listen(configs.webClientPort,configs.webClientIP)
      .on('listening', () => {
        console.log(`Web server listening on ${configs.webClientIP}:${configs.webClientPort}`);

        resolve();
      })
      .on('error', err => {
        reject(err);
      })
      .setTimeout(700000);

  });
}

module.exports.initialize = initialize;

function close() {
  return new Promise((resolve, reject) => {
    httpsServer.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });
}

module.exports.close = close;
//

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
    const dataStr=fs.readFileSync("./data/lims/"+currentUser+".json",
                                  {encoding:'utf8', flag:'r'});
    data.lims=JSON.parse(dataStr);
  } catch (e) {
      //console.log(e);
  }
}

//периодическое сохранение данных в файл
//и отправка на сервер по вебсокету
const dataToFilePost=async (hereDateStrIn)=>{
    try {
        if ((data.wsStat.auth) & (data.wsStat.connect)) {
          const dataSend={...data};
          dataSend.wsStat={...dataSend.wsStat};
          delete dataSend.wsStat.connection;
          const dataForWSS={type:'dataUpdate',data:dataSend, date: hereDateStrIn};
          data.wsStat.connection.sendUTF(JSON.stringify(dataForWSS));
        }
        else if (!data.wsStat.connect) {
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
  if ((!!configs.webServerIP) && (!!configs.webServerLogin) && (!!configs.webServerPwd)) {
    //если не первый запуск/запуск до настроек
    webSocketClient.init(data);
  }
  //интервальня обработка:
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
  },configs.counMSupd);
}
