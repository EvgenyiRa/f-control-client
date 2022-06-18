import React,{ useState,useRef } from 'react';
import { useIntl } from 'react-intl';
import BootstrapInput from '../components/BootstrapInput';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Settings() {
  const intl = useIntl();

  const refInputAlogin=useRef(),
        refInputApwd=useRef();

  const inputAloginObj={
    label:'Пароль',
    id:"admPwd",
    defaultValue:''
  };

  const inputApwdObj={
    label:'Логин',
    id:"admLogin",
    defaultValue:''
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
    </div>
  );
}

export default Settings;
