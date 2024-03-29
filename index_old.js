#!/usr/bin/node
const configs=require('./configs/configs.js'),
      { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      fs = require("fs"),
      dfns=require('date-fns');

console.log("Start f-control");

//Признак коннекта к серверу
let wsConnect=false;
console.log("Подключение к серверу "+configs.webServer+" по WebSocket");
// Создаётся экземпляр клиента
const WebSocketClient = require('websocket').client,
      wsClient = new WebSocketClient();
// Вешаем на него обработчик события подключения к серверу
wsClient.on('connect', wsHandler);
function wsHandler(connection) {
  console.log('WebSocket Client Connected');
  wsConnect=true;
  connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
  });
  connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
      wsConnect=false;
  });
  connection.on('message', function(message) {
      if (message.type === 'utf8') {
          console.log("Received: '" + message.utf8Data + "'");
      }
  });
  // посылаем сообщение серверу
  connection.sendUTF('Hi, there!');
}
// Подключаемся к нужному ресурсу
wsClient.connect(configs.webSocketServer);
//ошибка подключения
wsClient.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
    wsConnect=false;
});

const hereDateTime=new Date(),
      hereDateStr=dfns.format(hereDateTime, 'dd-MM-yyyy');
let data={timeAll:0,access:true,netstat:{}},
    lims,
    lastDate=hereDateStr,
    timeAllDelta=performance.now(),
    countMSsaveTek=0;
const currentUser=execSync('whoami').toString().slice(0, -1);
console.log(currentUser);
try {
  const dataStr=fs.readFileSync("./data/data_"+currentUser+'_'+hereDateStr+".json",
                                {encoding:'utf8', flag:'r'});
  data=JSON.parse(dataStr);
} catch (e) {
    //console.log(e);
}
try {
  const dataStr=fs.readFileSync("./data/lims_"+currentUser+".json",
                                {encoding:'utf8', flag:'r'});
  lims=JSON.parse(dataStr);
} catch (e) {
    //console.log(e);
}


const dataToFilePost=async (hereDateStrIn)=>{
    try {
      const dataFSBody={webServerLogin:configs.webServerLogin,data:data,date:hereDateStrIn,currentUser:currentUser};
      const dataS=await rp({
        method: `POST`,
        uri: configs.webServer+'/f-client/save',
        body: dataFSBody,
        json:true
      });
      //console.log(dataS);
      if (!!dataS.lims) {
        //обрабатываем ответ
        lims=dataS.lims;
        fs.writeFileSync("./data/lims_"+currentUser+".json", JSON.stringify(dataS.lims));
      }
    } catch (err) {
      //console.log(err);
    } finally {
      fs.writeFileSync("./data/data_"+currentUser+'_'+hereDateStrIn+".json", JSON.stringify(data));
    }
}

const timerId = setInterval(async ()=> {
  try {
    const hereDateTimeNew=new Date(),
          hereDateStrNew=dfns.format(hereDateTimeNew, 'dd-MM-yyyy');
    if (hereDateStrNew!==lastDate) {
        await dataToFilePost(lastDate);
        data={};
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
      data.lastWin=winObj;
      //суммируем время активных окон
      let winsActiveSumObj;
      //console.log(winsActiveSumStr);
      const timeAllDelta2=performance.now();
      if (!!data['winsActiveSum']) {
          winsActiveSumObj=data['winsActiveSum'];
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
      data['winsActiveSum']=winsActiveSumObj;
      data['timeAll']=data['timeAll']+(timeAllDelta2-timeAllDelta);
      countMSsaveTek+=timeAllDelta2-timeAllDelta;
      if (countMSsaveTek>=configs.countMSsave) {
          countMSsaveTek=0;
          await dataToFilePost(lastDate);
          //console.log(data);
          //await dataToFilePost(lastDate);
      }

      /* пока оставили как пример разбора ответа от многострочного ответа linux
      //мониторинг всех активных подкючений программ
        let stdout = execSync('netstat -p inet –program')
                      .toString()
                      .slice(0, -1)
                      .split('PID/Program name')[1];
      while (((stdout[0]===' ') || (stdout[0]===String.fromCharCode(10)) || (stdout[0]===String.fromCharCode(13))) & (stdout.length>0)) {
          stdout=stdout.substr(1);
      }
      let process=stdout.split(String.fromCharCode(10));
      //console.log(process);
      const oneStrWork=(process_i)=>{
        let tekStrAll=process_i,
            oneStr=[],
            tekStr=tekStrAll[0];
        //console.log(tekStr);
        //processAll.push(.split(' '))
        for (var j = 1; j < tekStrAll.length; j++) {
          if (tekStrAll[j]===' ') {
            if (tekStr!==' ') {
                if (tekStrAll[j+1]!=='-') {
                  oneStr.push(tekStr);
                  tekStr=' ';
                }
                else {
                    tekStr+=tekStrAll[j];
                }
            }
            else {
                tekStr=' ';
            }
          }
          else {
            if (tekStr!==' ') {
                tekStr+=tekStrAll[j];
            }
            else {
                tekStr=tekStrAll[j];
            }
          }
        }
        if (tekStr!==' ') {
          oneStr.push(tekStr);
        }
        if (oneStr.length>6) {
          const newCols=oneStr[6].split('/');
          oneStr[6]=parseInt(newCols.shift());
          oneStr[7]=newCols.join('/')
        }
        return oneStr;
      }


      for (var i = 0; i < process.length; i++) {
        const oneStr=oneStrWork(process[i]);
        if ((oneStr.length>6) & (!isNaN(oneStr[6])) & (oneStr[6])!==null) {
          console.log(typeof oneStr[6]);
          data.netstat[oneStr[4].split(':')[0]]=oneStr;
        }
      }
      //console.log(data.netstat);
      */

      //проверяем превышение лимитов
      if (!!lims) {
        let rows=lims.sys;
        const timeAllClient=data.timeAll/1000;
        data.access=true;
        if (rows['TIME_ALL']>0) {
          if (rows['TIME_ALL']<timeAllClient) {
            data.access=false;
          }
        }
        if (!!lims.proc) {
          rows=lims.proc;
          if (rows.length>0) {
            //console.log(data.winsActiveSum);
            for (var i = 0; i < rows.length; i++) {
              const rowOne=rows[i];
              if (!!data.winsActiveSum[rowOne['PRC_NAME']]) {
                const timeAllDeltaClient=data.winsActiveSum[rowOne['PRC_NAME']].timeAllDelta/1000;
                data.winsActiveSum[rowOne['PRC_NAME']].access=true;
                if (rowOne['LIM']<timeAllDeltaClient) {
                    data.winsActiveSum[rowOne['PRC_NAME']].access=false;
                }
              }
            }
          }
        }
      }

      if (!data.access) {
        if (configs.test) {
          console.log("gnome-session-quit --no-prompt");
        }
        else {
          execSync("gnome-session-quit --no-prompt");
        }
      }
      //убиваем запрещенные процессы
      for (var key in data.winsActiveSum) {
          const oneWin=data.winsActiveSum[key];
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
