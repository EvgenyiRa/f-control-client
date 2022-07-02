import React,{ useState,useRef,useEffect } from 'react';
import { useIntl } from 'react-intl';
import BootstrapInput from '../components/BootstrapInput';
import MultiselectBoot from '../components/MultiselectBoot';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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
     if (!!api.getConfigs) {
        const res=await api.getConfigs();
        setParamGroup(res);
        if (!!res.adminLogin) {
            refInputAlogin.current.setState({value:res.adminLogin})
        }
        if (!!res.adminPwd) {
            refInputApwd.current.setState({value:res.adminPwd})
        }

        if (!!res.webServerProtocol) {
            //refmSelectWSprotocol.current.setState({value:res.webServerProtocol})
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
     }
  }

  const refInputAlogin=useRef(),
        refInputApwd=useRef(),
        refmSelectWSprotocol=useRef(),
        refInputWShost=useRef(),
        refInputWSuserID=useRef(),
        refInputWSkey=useRef();

  const inputAloginObj={
    label:'Пароль',
    id:"admPwd",
    defaultValue:'',
    type:'password'
  };

  const inputApwdObj={
    label:'Логин',
    id:"admLogin",
    defaultValue:''
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
    id:"wsHost",
    defaultValue:'',
    type:'text'
  };

  const inputWSuserIDObj={
    label:'ID пользователя',
    id:"wsUserID",
    defaultValue:'',
    type:'number'
  };

  const inputWSkeyObj={
    label:'Ключ пользователя',
    id:"wsUserKey",
    defaultValue:'',
    type:'number'
  };

  return (
    <div className="App">
      <div>
        <header style={{padding: '0 1rem'}}>
          <h1>
            {intl.formatMessage({ id: 'settings' })}
          </h1>

        </header>
      </div>
      <Container fluid style={{
            border:'1px solid black',
            borderRadius:'0.5rem',
            padding: '1rem'
           }}>
        <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
          Администратор
        </Row>
        <Row
        >
          <Col>
            <BootstrapInput ref={refInputAlogin} obj={inputAloginObj}/>
          </Col>
          <Col>
            <BootstrapInput ref={refInputApwd} obj={ inputApwdObj }/>
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
    </div>
  );
}

export default Settings;
