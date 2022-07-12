'use strict';
const configs=require('../../configs/configs.js'),
      common=require('../../services/common.js'),
      salts=require('../../configs/salts.js'),
      bcrypt = require('bcryptjs');

module.exports = async (configsIn) => {
  //проверки
  let prOk,
      prOk2,
      strErr='';
  [prOk,configsIn.adminLogin]=common.checkRequired(configsIn.adminLogin);
  if (!prOk) {
      strErr='Поле "Логин администратора" не может быть пустым\n';
  }

  if (!!configs.adminLogin) {
      let pwdNew=configsIn.adminPwd;
      if (!!pwdNew) {
          pwdNew=pwdNew.trim();
      }
      else {
          pwdNew='';
      }
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
              prOk2=true;
              strErr+='Поле "Старый пароль администратора" указано не верно\n';
              break;
            }
          }
        }
        if (prOk) {
            prOk=prOk2;
        }
      }
  }
  else {
      [prOk2,configsIn.adminPwd]=common.checkRequired(configsIn.adminPwd);
      if (!prOk2) {
          strErr+='Поле "Новый пароль администратора" не может быть пустым\n';
      }
      if (prOk) {
          prOk=prOk2;
      }
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

  if (prOk) {
      //считываем шаблон, заносим данные, вырубаем процесс сервера (должно возобновиться автоматически демоном)
  }
  return {prOk:prOk,strErr:strErr};
};
