'use strict';
const configs=require('../../configs/configs.js'),
      common=require('../../services/common.js'),
      salts=require('../../configs/salts.js'),
      bcrypt = require('bcryptjs'),
      path = require('path'),
      fs = require('fs');

module.exports = async (configsIn) => {
  //проверки
  let prOk,
      prOk2,
      strErr='';
  [prOk,configsIn.adminLogin]=common.checkRequired(configsIn.adminLogin);
  if (!prOk) {
      strErr='Поле "Логин администратора" не может быть пустым\n';
  }
  else {
      configsIn.adminLogin=configsIn.adminLogin.split("'").join("\\'");
  }

  let pwdNew;
  [prOk2,pwdNew]=common.checkRequired(configsIn.adminPwd);
  if (!!configs.adminLogin) {
      if ((pwdNew!=='') || (configsIn.adminLogin!==configs.adminLogin)) {
        [prOk2,configsIn.adminPwdOld]=common.checkRequired(configsIn.adminPwdOld);
        if (!prOk2) {
            strErr+='Поле "Старый пароль администратора" не может быть пустым, если меняется "Логин" или "Пароль"\n';
        }
        else {
          prOk2=false;
          for (var i = 0; i < salts.length; i++) {
            const oneHash=await bcrypt.hash(configsIn.adminPwdOld, salts[i]);
            //console.log("oneHash:",oneHash);test
            if (oneHash===configs.adminPwd) {
              configsIn.adminPwd=oneHash;
              prOk2=true;
              break;
            }
          }
          if (!prOk2) {
            strErr+='Поле "Старый пароль администратора" указано не верно\n';
          }
        }
        if (prOk) {
            prOk=prOk2;
        }
      }
  }
  else {
      if (!prOk2) {
          strErr+='Поле "Новый пароль администратора" не может быть пустым\n';
      }
      if (prOk) {
          prOk=prOk2;
      }
  }
  if ((prOk) & (pwdNew!=='')) {
      const indexKey=common.getRandomInRange(0,salts.length-1);
      /*console.log('indexKey',indexKey);
      console.log('pwdNew',pwdNew);*/
      configsIn.adminPwd=await bcrypt.hash(pwdNew, salts[indexKey]);
  }
  else if ((prOk) & (pwdNew===''))  {
      configsIn.adminPwd=configs.adminPwd;
  }

  [prOk2,configsIn.webClientIP]=common.checkRequired(configsIn.webClientIP);
  if (prOk) {
      prOk=prOk2;
  }
  if (!prOk2) {
      strErr+='Поле "IP локального WEB-сервера" не может быть пустым\n';
  }
  [prOk2,configsIn.webClientPort]=common.checkRequired(configsIn.webClientPort);
  if (prOk) {
      prOk=prOk2;
  }
  if (!prOk2) {
      strErr+='Поле "Порт локального WEB-сервера" не может быть пустым\n';
  }

  const ckeckNum=(refInNum,msCool)=>{
    [prOk2,configsIn[refInNum]]=common.checkRequired(configsIn[refInNum]);
    const nameKey=(refInNum==='countMSsave')?'"Кол-во МС сохранения"':'"Кол-во МС обновления"';
    if (prOk2) {
      let countMSsave=parseInt(configsIn[refInNum]);
      if (!isNaN(countMSsave)) {
        if (countMSsave<msCool) {
            countMSsave=msCool;
            prOk2=false;
        }
      }
      else {
          prOk2=false;
          countMSsave=msCool;
      }
      if (!prOk2) {
          strErr+='Поле '+nameKey+' должно быть не менее '+msCool+' миллисекунд\n'
      }
    }
    else {
      strErr+='Поле '+nameKey+' не может быть пустым\n';
    }
    if (prOk) {
      prOk=prOk2;
    }
  }
  ckeckNum('countMSsave',10000);
  ckeckNum('countMSupd',1000);

  if (!configsIn.hasOwnProperty('webServerIP')) {
    configsIn.webServerIP=undefined;
  }
  if (!configsIn.hasOwnProperty('repUserId')) {
    configsIn.repUserId=undefined;
  }
  if (!configsIn.hasOwnProperty('keyForWebServer')) {
    configsIn.keyForWebServer=undefined;
  }
  if (configsIn.hasOwnProperty('adminPwdOld')) {
    delete configsIn.adminPwdOld;
  }

  if (!!configsIn.webServerIP) {
    configsIn.webServerIP=configsIn.webServerIP.split("'").join("\\'");
  }
  configsIn.webClientIP=configsIn.webClientIP.split("'").join("\\'");
  if (!!configsIn.keyForWebServer) {
    configsIn.keyForWebServer=configsIn.keyForWebServer.split("'").join("\\'");
  }

  if (prOk) {
      //считываем шаблон, заносим данные, вырубаем процесс сервера на следующем шаге (должно возобновиться автоматически демоном)
      let configsT='const configs={\n';
      for (var key in configsIn) {
          let val;
          if (typeof configsIn[key]==='string') {
              val="'"+configsIn[key]+"'";
          }
          else {
              val=configsIn[key];
          }
          configsT+='  '+key+':'+val+',\n';
      }
      configsT+='};';
      const pathRoot=path.dirname(path.dirname(__dirname)),
            pathConfigs=path.join(pathRoot,'configs');
      //console.log('pathConfigs',pathConfigs);
      configsT+= fs.readFileSync(path.join(pathConfigs,'configs.js.template'), 'utf8')
                   .split('//split')[1];
      fs.writeFileSync(path.join(pathConfigs,'configs.js'), configsT);
      //записываем новые данные о сервере в Реакт
      const pathRconfigs=path.join(pathRoot,'react-olap','build','config.json'),
            dataRconfigs=JSON.parse(fs.readFileSync(pathRconfigs, 'utf8'));
      dataRconfigs.dataServer=configsIn.webClientIP+':'+configsIn.webClientPort;
      fs.writeFileSync(pathRconfigs, JSON.stringify(dataRconfigs));     
  }
  return {prOk:prOk,strErr:strErr};
};
