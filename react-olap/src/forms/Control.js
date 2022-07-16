import React,{ useState,useRef,useEffect } from 'react';
import { useIntl } from 'react-intl';
import Loading from '../components/Loading';
import AlertPlus from '../components/AlertPlus';
import MultiselectAPI from '../components/MultiselectAPI';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import {api} from '../ws.js';

function Control() {
  const intl = useIntl();

  const refLoading=useRef(),
        refAlertPlus=useRef();

  const [lims, setLims] = useState(undefined);
  const [paramGroup, setParamGroup] = useState({user:-777});
  useEffect(() => {
    setLimsState();
    //console.log(api);
  },[api]);
  const setLimsState=async()=> {
     if (!!api.control.getLims) {
        const res=await api.control.getLims();
        setLims(res);
        refLoading.current.handleHide();
     }
     else {
       refLoading.current.handleShow();
     }
  }

  //объект для выпадающего списка с данными из БД
  const selectUserObj={
    stateLoadObj:refLoading,
    label:'Контролируемые пользователи',
    paramGroup:paramGroup,
    setParamGroup:setParamGroup,
    //наименование параметра для зависимых(дочерних) элементов
    parChealdID:"user",
    //необходимо наличие двух полей с именами value,label
    //apiMethod:'control.getUsers',
    apiData:lims,
    apiDataFunc:(data,params,thisV)=>{
        const res=[];
        for (var key in data) {
            res.push({value:key,label:key});
        }
        return res;
    },
    id:"selectUsers"
   };

  return (
    <div className="App">
      <div>
        <header style={{padding: '0 1rem'}}>
          <h1>
            {intl.formatMessage({ id: 'control' })}
          </h1>

        </header>
      </div>
      <Loading ref={refLoading} />
      <AlertPlus ref={refAlertPlus}/>
      <Container fluid>
        <Row>
          <Col>
            <MultiselectAPI obj={selectUserObj}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Control;
