const configs=require('../configs/configs.js'),
      lurl=require('url'),
      { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      dfns=require('date-fns'),
      webSocketClient=require('./webSocketClient.js'),
      hereDateTime=new Date(),
      hereDateStr=dfns.format(hereDateTime, 'dd-MM-yyyy'),
      currentUser=execSync('whoami').toString().slice(0, -1),
      express = require('express'),
      fs = require('fs'),
      path = require('path'),
      bodyParser = require('body-parser'),
      data={
        data:{timeAll:0,access:true},
        lims:{},
        login:currentUser,
        wsStat:{auth:false,connect:false}
      };

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

    app.all('*', function(req, res, next) {
        const { pathname } = lurl.parse(request.url);
        if (pathname==='/ch_fc') {
          next();
        }
    });

    app.use(bodyParser.json({limit: '100mb', extended: true}));
    //app.use('/ch_fc', routerChFC);

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

webSocketClient.init(data);

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

//периодическое сохранение данных в файл
//и отправка на сервер по вебсокету
const dataToFilePost=async (hereDateStrIn)=>{
    try {
      const dataFSBody={repUserId:configs.repUserId,data:data,date:hereDateStrIn,currentUser:currentUser};
      const dataS=await rp({
        method: `POST`,
        uri: configs.webServer+'/f-client/save',
        body: dataFSBody,
        json:true
      });
    } catch (err) {
      //console.log(err);
    } finally {
      fs.writeFileSync("./data/data_"+currentUser+'_'+hereDateStrIn+".json", JSON.stringify(data.data));
    }
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

    //получаем активное окно и время выполнения процесса
    try {
      let winPIDstring = execSync("xprop -id $(xprop -root 32x '\t$0' _NET_ACTIVE_WINDOW | cut -f 2) _NET_WM_PID").toString();
      //let winPIDstring=winPID.toString();
      winPIDstring=winPIDstring.slice(0, -1).split('_NET_WM_PID(CARDINAL) = ')[1];
      //console.log(winPIDstring);
      const winPNAME = execSync("ps -p "+winPIDstring+" -o comm="),
            winPTime = execSync("ps -p "+winPIDstring+" -o etimes"),
            winObj={time:performance.now()};
      let winPNAMEstring=winPNAME.toString();
      if (typeof winPNAMEstring==='string') {
          winPNAMEstring=winPNAMEstring.slice(0, -1);
          winObj['name']=winPNAMEstring;
      }
      //console.log(winPNAMEstring);
      let winPTimeString=winPTime.toString(),
          winPTimeNum;
      if (typeof winPTimeString==='string') {
          winPTimeString=winPTimeString.slice(0, -1).split(' ');
          winPTimeString=winPTimeString[winPTimeString.length-1];
          winPTimeNum=parseInt(winPTimeString);
          winObj['times']=winPTimeNum;
      }
      //console.log(winPNAME.toString());
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
              const lastTimeProcessF=winsActiveSumObj[winPNAMEstring]['lastTimeProcess'];
              let timeAllF=winsActiveSumObj[winPNAMEstring]['timeAll'];
              if (lastTimeProcessF>winPTimeNum) {
                  timeAllF+=lastTimeProcessF;
              }
              const timeAllUserF=timeAllF+winPTimeNum,
                    winTimeAllDelta=winsActiveSumObj[winPNAMEstring]['timeAllDelta']+(timeAllDelta2-timeAllDelta);
              winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:timeAllF,timeAllUser:timeAllUserF,timeAllDelta:winTimeAllDelta,pid:+winPIDstring,access:winsActiveSumObj[winPNAMEstring]['access']};
          }
          else {
              winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:0,timeAllUser:winPTimeNum,timeAllDelta:(timeAllDelta2-timeAllDelta),pid:+winPIDstring,access:true};
          }
      }
      else {
          winsActiveSumObj={};
          winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:0,timeAllUser:winPTimeNum,timeAllDelta:(timeAllDelta2-timeAllDelta),pid:+winPIDstring,access:true};
      }
      data.data['winsActiveSum']=winsActiveSumObj;
      data.data['timeAll']=data.data['timeAll']+(timeAllDelta2-timeAllDelta);
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

      if (!data.data.access) {
        if (configs.test) {
          console.log("gnome-session-quit --no-prompt");
        }
        else {
          execSync("gnome-session-quit --no-prompt");
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
