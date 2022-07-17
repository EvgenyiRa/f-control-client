import React,{ useState,useRef,useEffect } from 'react';
import { useIntl } from 'react-intl';
import Loading from '../components/Loading';
import AlertPlus from '../components/AlertPlus';
import MultiselectAPI from '../components/MultiselectAPI';
import BootstrapInput from '../components/BootstrapInput';
import TableAPI from '../components/TableAPI';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { format } from 'date-fns';
import {api} from '../ws.js';

function Control() {
  const intl = useIntl();

  const refLoading=useRef(),
        refAlertPlus=useRef();

  const tekDate=new Date();

  const [apiData, setApiData] = useState({lims:undefined,data:undefined});
  const [paramGroup, setParamGroup] = useState({user:-777,date:format(tekDate,'dd-MM-yyyy')});
  useEffect(async () => {
    if (!!api.control.getLims) {
       if (refLoading.current!==null)
          refLoading.current.handleShow();
       const res=await api.control.getLims();
       setApiData({lims:res});
       if (refLoading.current!==null)
          refLoading.current.handleHide();
    }
  },[api]);

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
    apiData:apiData,
    apiDataFunc:(data,params,thisV,prevProps)=>{
        const res=[];
        for (var key in data.lims) {
            res.push({value:key,label:key});
        }
        return res;
    },
    beforeGetAPI:(thisV,parForAPI,prevProps)=>{
      if (thisV.props.obj.apiData.lims===prevProps.apiData.lims) {
        return false;
      }
      else {
        return true;
      }
    },
    setApiData:setApiData,
    id:"selectUsers",
    afterLoadData:(thisV,res)=>{
        thisV.props.obj.handleChange(res,true,thisV);
    },
    handleChange:async (option, checked, thisV)=>{
      refLoading.current.handleShow();
      const res=await api.control.getData(option[0].value,thisV.props.obj.paramGroup.date),
            newApiData={...apiData};
      newApiData.data=res;
      thisV.props.obj.setApiData(newApiData);
      refLoading.current.handleHide();
    }
   };

   //объект для таблицы с данными из БД
   const tableAPIObj={
     stateLoadObj:refLoading,
      tableContainerClass:'max-content',
      bodyClasses:'body_row_dblclick',
      tab_id:"tab1",
      paramGroup:paramGroup,
      parParentID:['user','date'],      
     keyField:'id',
     columns:[
       {dataField:'lim',text:'Ограничение',headerAttrs: (column, colIndex) => ({ 'width': `150px` })},
       {dataField:'value',text:'Текущее значение',headerAttrs: (column, colIndex) => ({ 'width': `150px` })}
     ],
     apiData:apiData,
     apiDataFunc:async (data,params,thisV)=>{
       if ((!!data.lims) & (!!data.data)) {
         return [{
           id:1,
           lim:data.lims[thisV.props.obj.paramGroup.user].sys.TIME_ALL.toFixed(0),
           value:(data.data.timeAll/1000).toFixed(0)
         }];
       }
       else {
         return [];
       }
     },
     //действия панели таблицы
    /*paginationFactory:paginationFactory,
    paginationOptions:{
      paginationSize: 7,
      sizePerPageList: [{
          text: '10', value: 10
        }, {
          text: '50', value: 50
        }, {
          text: '100', value:100
        }, {
          text: '500', value:500
        }]
    },
    filterFactory:filterFactory*/
  };

  const inputDateObj={
    label:'Дата',
    id:"date",
    type:'date',
    defaultValue:format(tekDate,'yyyy-MM-dd'),
    paramGroup:paramGroup,
    setParamGroup:setParamGroup,
    parChealdID:"date",
    onChange:(event,thisV)=>{
      const newObj = { ...thisV.props.obj.paramGroup };
      newObj[thisV.props.obj.parChealdID]=format(new Date(event.target.value),'dd-MM-yyyy');
      thisV.props.obj.setParamGroup(newObj);
      thisV.setState({value:event.target.value});
    }
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
          <Col>
            <BootstrapInput obj={inputDateObj}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <TableAPI obj={tableAPIObj}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Control;
