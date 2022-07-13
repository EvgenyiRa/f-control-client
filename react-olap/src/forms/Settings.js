import React,{ useState,useRef,useEffect } from 'react';
import { useIntl } from 'react-intl';
import BootstrapInput from '../components/BootstrapInput';
import MultiselectBoot from '../components/MultiselectBoot';
import BootstrapCheckbox from '../components/BootstrapCheckbox';
import AlertPlus from '../components/AlertPlus';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {api} from '../ws.js';
import {getParamDiff} from '../system.js';

function Settings() {
  const intl = useIntl();

  const [paramGroup, setParamGroup] = useState(undefined);
  useEffect(() => {
    setConfigs();
    //console.log(api);
  },[api]);
  const setConfigs=async()=> {
     if (!!api.configs.get) {
        const res=await api.configs.get();
        setParamGroup(res);
        if (!!res.adminLogin) {
            refInputAlogin.current.setState({value:res.adminLogin})
        }
        /*if (!!res.adminPwd) {
            refInputApwd.current.setState({value:res.adminPwd})
        }*/

        if (!!res.webServerProtocol) {
            refmSelectWSprotocol.current.handleSetCheckeds(res.webServerProtocol);
        }
        if (!!res.webServerIP) {
            refInputWShost.current.setState({value:res.webServerIP})
        }
        if (!!res.repUserId) {
            refInputWSuserID.current.setState({value:res.repUserId})
        }
        if (!!res.keyForWebServer) {
            refInputWSkey.current.setState({value:res.keyForWebServer})
        }

        if (!!res.webClientIP) {
            refInputLSip.current.setState({value:res.webClientIP})
        }
        if (!!res.webClientPort) {
            refInputLSport.current.setState({value:res.webClientPort})
        }
        if (!!res.countMSsave) {
            refInputLScountMSsave.current.setState({value:res.countMSsave})
        }
        if (!!res.countMSupd) {
            refInputLScountMSupd.current.setState({value:res.countMSupd})
        }
        if (typeof res.test==='boolean') {
            refCheckboxLStest.current.setState({checked:res.test})
        }

        //test ws
        /*api.test.test2.getTestWs().then((resTestWs) => {
          console.log(resTestWs);
        });
        api.test.test2.getTestWs2().then((resTestWs2) => {
          console.log(resTestWs2);
        });*/
     }
  }

  const refInputAlogin=useRef(),
        refInputApwd=useRef(),
        refInputApwdOld=useRef(),
        refmSelectWSprotocol=useRef(),
        refInputWShost=useRef(),
        refInputWSuserID=useRef(),
        refInputWSkey=useRef(),
        refInputLSip=useRef(),
        refInputLSport=useRef(),
        refInputLScountMSsave=useRef(),
        refInputLScountMSupd=useRef(),
        refCheckboxLStest=useRef(),
        refAlertPlus=useRef();

  const inputAloginObj={
    label:'Логин',
    id:"admLogin",
  };

  const inputApwdObj={
    label:'Новый пароль',
    id:"admPwd",
    type:'password'
  };

  const inputApwdOldObj={
    label:'Старый пароль',
    id:"admPwd",
    type:'password'
  };

  const mSelectWSprotocolObj={
    label:'Протокол',
    id:"wsPrtcl",
    options:[
      {label:'https', value:'https',checked:true},
      {label:'http', value:'http'}
    ]
  };

  const inputWShostObj={
    label:'Хост',
    id:"wsHost"
  };

  const inputWSuserIDObj={
    label:'ID пользователя',
    id:"wsUserID",
    type:'number'
  };

  const inputWSkeyObj={
    label:'Ключ пользователя',
    id:"wsUserKey"
  };

  const inputLSipObj={
    label:'IP',
    id:"lsIP"
  };

  const inputLSportObj={
    label:'Порт',
    id:"lsPort"
  };

  const inputLScountMSsaveObj={
    label:'Кол-во МС сохранения',
    id:"lsCountMSsave",
    type:'number'
  };

  const inputLScountMSupdObj={
    label:'Кол-во МС обновления',
    id:"lsCountMSupd",
    type:'number'
  };

  const checkboxLStestObj={
    label:'Тестовый режим',
    id:"lsTest",
    beginChecked:false
  };

  const ButtonSave=()=>{
      const handleClick=async ()=>{
        console.log(api);
        if ((!!api.configs.set) & (!!paramGroup)) {
          //проверки
          let prOk=refInputAlogin.current.checkRequired(),
              prOk2;
          if (!!paramGroup.adminLogin) {
              let pwdNew=refInputApwd.current.state.value;
              if (!!pwdNew) {
                  pwdNew=pwdNew.trim();
              }
              else {
                  pwdNew='';
              }
              if ((pwdNew!=='') || (refInputAlogin.current.state.value!==paramGroup.adminLogin)) {
                prOk2=refInputApwdOld.current.checkRequired();
                if (prOk) {
                    prOk=prOk2;
                }
              }
          }
          else {
              prOk2=refInputApwd.current.checkRequired();
              if (prOk) {
                  prOk=prOk2;
              }
          }

          prOk2=refInputLSip.current.checkRequired();
          if (prOk) {
              prOk=prOk2;
          }
          prOk2=refInputLSport.current.checkRequired();
          if (prOk) {
              prOk=prOk2;
          }

          const ckeckNum=(refInNum,msCool)=>{
            prOk2=refInNum.current.checkRequired();
            if (prOk2) {
              let countMSsave=parseInt(refInNum.current.state.value);
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
                  refInNum.current.setState({
                      value:countMSsave,
                      invalidText:'Должно быть не менее '+msCool+' миллисекунд'
                  });
              }
            }
            if (prOk) {
              prOk=prOk2;
            }
          }
          ckeckNum(refInputLScountMSsave,10000);
          ckeckNum(refInputLScountMSupd,1000);

          if (prOk) {
            const objNew={
              webServerIP: refInputWShost.current.state.value,
              webServerProtocol: refmSelectWSprotocol.current.state.checkedOptions,
              repUserId: refInputWSuserID.current.state.value,
              keyForWebServer:refInputWSkey.current.state.value,
              countMSsave:refInputLScountMSsave.current.state.value,
              countMSupd:refInputLScountMSupd.current.state.value,
              test:refCheckboxLStest.current.state.checked,
              webClientIP:refInputLSip.current.state.value,
              webClientPort:refInputLSport.current.state.value,
              adminLogin:refInputAlogin.current.state.value,
              adminPwd:refInputApwd.current.state.value,
              adminPwdOld:(typeof refInputApwdOld.current!=='undefined')?refInputApwdOld.current.state.value:undefined,
            };
            const resConfigsSet=await api.configs.set(objNew);
            console.log(resConfigsSet);
            if (resConfigsSet.prOk) {
              refAlertPlus.current.handleShow('Конфигурация сохранена');
              await api.configs.restart();
            }
          }
        }
      }
      return <Button variant="primary" onClick={handleClick}>Сохранить и перезапустить</Button>;
  }

  const AdminPwdOld=()=>{
    let prVis=false;
    if (!!paramGroup) {
      if (!!paramGroup.adminLogin) {
          prVis=true;
      }
    }
    if (prVis) {
      return <Col>
              <BootstrapInput ref={refInputApwdOld} obj={ inputApwdOldObj }/>
            </Col>;
    }
    else {
      return null;
    }
  }
  return (
    <div className="App">
      <div>
        <header style={{padding: '0 1rem'}}>
          <h1>
            {intl.formatMessage({ id: 'settings' })}
          </h1>

        </header>
      </div>
      <AlertPlus ref={refAlertPlus}/>
      <Container fluid>
        <Row style={{marginBottom:'1rem'}}>
          <ButtonSave/>
        </Row>
        <Row>
          <Container fluid style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Администратор
            </Row>
            <Row>
              <Col>
                <BootstrapInput ref={refInputAlogin} obj={inputAloginObj}/>
              </Col>
              <Col>
                <BootstrapInput ref={refInputApwd} obj={ inputApwdObj }/>
              </Col>
              <AdminPwdOld/>
            </Row>
          </Container>

          <Container fluid style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem',
                marginTop:'1rem'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Удаленный WEB-сервер
            </Row>
            <Row>
              <Col>
                <MultiselectBoot ref={refmSelectWSprotocol} obj={ mSelectWSprotocolObj }/>
              </Col>
              <Col>
                <BootstrapInput ref={refInputWShost} obj={inputWShostObj}/>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapInput ref={refInputWSuserID} obj={ inputWSuserIDObj }/>
              </Col>
              <Col>
                <BootstrapInput ref={refInputWSkey} obj={inputWSkeyObj}/>
              </Col>
            </Row>
          </Container>

          <Container fluid style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem',
                marginTop:'1rem'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Локальный WEB-сервер
            </Row>
            <Row>
              <Col>
                <BootstrapInput ref={refInputLSip} obj={ inputLSipObj }/>
              </Col>
              <Col>
                <BootstrapInput ref={refInputLSport} obj={inputLSportObj}/>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapInput ref={refInputLScountMSsave} obj={ inputLScountMSsaveObj }/>
              </Col>
              <Col>
                <BootstrapInput ref={refInputLScountMSupd} obj={inputLScountMSupdObj}/>
              </Col>
            </Row>
            <Row>
              <Col>
                <BootstrapCheckbox ref={refCheckboxLStest} obj={checkboxLStestObj}/>
              </Col>
            </Row>
          </Container>
        </Row>
        <Row style={{marginTop:'1rem'}}>
          <ButtonSave/>
        </Row>
      </Container>
    </div>
  );
}

export default Settings;
