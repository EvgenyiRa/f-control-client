const { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      fs = require("fs"),
      dfns=require('date-fns');

console.log("Start f-control");
const hereDateTime=new Date(),
      hereDateStr=dfns.format(hereDateTime, 'dd-MM-yyyy');
let data={timeAll:0},
    lastDate=hereDateStr,
    timeAllDelta=performance.now();
try {
  const dataStr=fs.readFileSync("./data/data_"+hereDateStr+".json",
                                {encoding:'utf8', flag:'r'});
  data=JSON.parse(dataStr);
} catch (e) {
    //console.log(e);
}

const dataToFile=(hereDateStrIn)=>{
    fs.writeFileSync("./data/data_"+hereDateStrIn+".json", JSON.stringify(data));
}

const timerId = setInterval(async ()=> {
  try {
    const hereDateTimeNew=new Date(),
          hereDateStrNew=dfns.format(hereDateTime, 'dd-MM-yyyy');
    if (hereDateStrNew!==lastDate) {
        dataToFile(lastDate);
        data={};
        lastDate=hereDateStrNew;
    }
    /*мониторинг всех процессов при желании
    const stdout = execSync('ps -eF');
    let process=stdout.toString().split(String.fromCharCode(10)),
        processAll={data:[]};
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
      oneStr.push(tekStr);
      return oneStr;
    }
    const processNameObj=oneStrWork(process[0]),
          processNameObjKey={};
    processNameObj.push('PNAME');
    for (var i = 0; i < processNameObj.length; i++) {
      processNameObjKey[processNameObj[i]]=i;
    }
    //console.log(processNameObjKey);
    processAll.processNameObjKey=processNameObjKey;
    for (var i = 1; i < process.length; i++) {
      const oneStr=oneStrWork(process[i]);
      ***if (!isNaN(oneStr[processNameObjKey['PID']])) {
        let procName=oneStr[processNameObjKey['CMD']];
        try {
          const stdoutPN = execSync("ps -p "+oneStr[processNameObjKey['PID']]+" -o comm=");
          //console.log(stdoutPN.toString());
          procName=stdoutPN.toString();
          if (procName[procName.length-1]===String.fromCharCode(10)) {
            procName=procName.slice(0, -1);
            //console.log(procName);
          }
        }
        catch (e) {
          //console.log(e);
          //console.log(oneStr);
        }
        oneStr.push(procName);
      }
      else {
        console.log(process[i]);
      }***
      processAll.data.push(oneStr);
      //test
      //break;
    }
    //пишем в файл
    fs.writeFileSync("./data/process_"+hereDateStr+".json", JSON.stringify(processAll));*/
    //console.log(processAll);
    //получаем активное окно и время выполнения процесса
    try {
      const winPrePID = execSync("xdotool getactivewindow"),
            winPID = execSync("xdotool getwindowpid "+winPrePID.toString());
      let winPIDstring=winPID.toString();
      winPIDstring=winPIDstring.slice(0, -1);
      const winPNAME = execSync("ps -p "+winPIDstring+" -o comm="),
            winPTime = execSync("ps -p "+winPIDstring+" -o etimes"),
            winObj={time:performance.now()};
      let winPNAMEstring=winPNAME.toString();
      if (typeof winPNAMEstring==='string') {
          winPNAMEstring=winPNAMEstring.slice(0, -1);
          winObj['name']=winPNAMEstring;
      }
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
              winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:timeAllF,timeAllUser:timeAllUserF,timeAllDelta:winTimeAllDelta};
          }
          else {
              winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:0,timeAllUser:winPTimeNum,timeAllDelta:(timeAllDelta2-timeAllDelta)};
          }
      }
      else {
          winsActiveSumObj={};
          winsActiveSumObj[winPNAMEstring]={lastTimeProcess:winPTimeNum,timeAll:0,timeAllUser:winPTimeNum,timeAllDelta:(timeAllDelta2-timeAllDelta)};
      }
      data['winsActiveSum']=winsActiveSumObj;
      data['timeAll']=data['timeAll']+(timeAllDelta2-timeAllDelta);
      timeAllDelta=timeAllDelta2;
    } catch (e) {
      console.error(e); // should contain code (exit code) and signal (that caused the termination).
    }
    //fs.writeFileSync("./data/lastWin.json", JSON.stringify({time:performance.now()}));
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
},3000);

const timerSavePost = setInterval(async ()=> {
    dataToFile(lastDate);
},5000);
