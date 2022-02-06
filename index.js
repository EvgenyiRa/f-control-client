const { performance } = require('perf_hooks'),
      rp = require('request-promise'),
      util = require('util'),
      execSync = require('child_process').execSync,
      fs = require("fs");

const timerId = setInterval(async ()=> {
  try {
    console.log("Start f-control");
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
      /*if (!isNaN(oneStr[processNameObjKey['PID']])) {
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
      }*/
      processAll.data.push(oneStr);
      //test
      //break;
    }
    //пишем в файл
    fs.writeFileSync("./data/process.json", JSON.stringify(processAll));
    //console.log(processAll);
    //получаем активное окно
    /*const winPrePID = execSync("xdotool getactivewindow"),
          winPID = execSync("xdotool getwindowpid "+winPrePID.toString()),
          winPNAME = execSync("ps -p "+winPID.toString()+" -o comm="),
          winPNAMEstring=winPNAME.toString(),
          winObj={time:performance.now()};
    if (typeof winPNAMEstring==='string') {
        winObj['name']=winPNAMEstring;
    }
    //console.log(winPNAME.toString());
    fs.writeFileSync("./data/lastWin.json", JSON.stringify(winObj));*/
    fs.writeFileSync("./data/lastWin.json", JSON.stringify({time:performance.now()}));
  } catch (e) {
    console.error(e); // should contain code (exit code) and signal (that caused the termination).
  }
},3000);
