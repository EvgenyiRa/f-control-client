import React,{ useState,useRef,useEffect,createRef } from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Loading from '../components/Loading';
import AlertPlus from '../components/AlertPlus';
import ConfirmPlus from '../components/ConfirmPlus';
import MultiselectAPI from '../components/MultiselectAPI';
import BootstrapInput from '../components/BootstrapInput';
import TableAPI from '../components/TableAPI';
import WinModal from '../components/WinModal';
import paginationFactory from 'react-bootstrap-table2-paginator';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import cellEditFactory, { Type }  from 'react-bootstrap-table2-editor';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { format,parse } from 'date-fns';
import {api} from '../ws.js';
import {secondstotime} from '../system.js'

class QualityTime extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onUpdate: PropTypes.func.isRequired
  }
  static defaultProps = {
    value: undefined
  }
  getValue() {
    return this.time.value;
  }
  render() {
    const { value, onUpdate, ...rest } = this.props;
    return <input
            { ...rest }
            key="time"
            ref={ node => this.time = node }
            type="time"
            step="30"
          />;
  }
}

function Control() {
  const intl = useIntl();

  const refLoading=useRef(),
        refAlertPlus=useRef(),
        refConfirmPlus=useRef(),
        refWinModal=useRef(),
        refTabUsrAdd=useRef(),
        refBootInAddUsrL1=useRef(),
        refBootInAddUsrL2=useRef(),
        refBootInAddUsrL3=useRef();

  const tekDate=new Date();

  const [apiData, setApiData] = useState({lims:undefined,data:undefined});
  const [paramGroup, setParamGroup] = useState({user:-777,date:format(tekDate,'dd-MM-yyyy')});
  useEffect(() => {
    const getLims=async ()=>{
      if (!!api.control.getLims) {
         if (refLoading.current!==null)
            refLoading.current.handleShow();
         const res=await api.control.getLims();
         setApiData({lims:res});
         if (refLoading.current!==null)
            refLoading.current.handleHide();
         //console.log(await api.control.getUsers());
      }
    }
    getLims();
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
    beforeGetAPI:(thisV,parForAPI,prevProps)=>{
      if (thisV.props.obj.apiData.lims===prevProps.apiData.lims) {
        return false;
      }
      else {
        return true;
      }
    },
    apiData:apiData,
    apiDataFunc:(data,params,thisV,prevProps)=>{
        const res=[];
        for (var key in data.lims) {
            res.push({value:key,label:key});
        }
        return res;
    },
    setApiData:setApiData,
    id:"selectUsers",
    afterLoadData:(thisV,res)=>{
        thisV.props.obj.handleChange(res,true,thisV);
    },
    handleChange:async (option, checked, thisV)=>{
      refLoading.current.handleShow();
      if (option.length>0) {
        const res=await api.control.getData(option[0].value,thisV.props.obj.paramGroup.date),
              newApiData={...apiData};
        if (Object.keys(res).length>0) {
          newApiData.data=res;
        }
        else {
          newApiData.data=undefined;
        }
        thisV.props.obj.setApiData(newApiData);
      }
      refLoading.current.handleHide();
    },
    styleBMC:{display:'inline-block',marginRight: 0}
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
       {dataField:'lim',text:'Ограничение',headerAttrs: (column, colIndex) => ({ 'width': `200px` }),
       editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) =>
        <QualityTime { ...editorProps } value={ value }/>
       },
       {dataField:'value',text:'Текущее значение',headerAttrs: (column, colIndex) => ({ 'width': `200px` }),editable:false}
     ],
     apiData:apiData,
     apiDataFunc:(data,params,thisV)=>{
       let result=[];
       if (!!data.lims) {
         if (thisV.props.obj.paramGroup.user!==-777) {
           if (!!data.lims[thisV.props.obj.paramGroup.user]) {
             result=[{
               id:1,
               lim:(data.lims[thisV.props.obj.paramGroup.user].sys.TIME_ALL<86400)?secondstotime((data.lims[thisV.props.obj.paramGroup.user].sys.TIME_ALL*1000),0,true,true):'23:59:59',
               value:(!!data.data)?secondstotime(data.data.timeAll,0,true,true):''
             }];
           }
         }
       }
       return result;
     },
     cellEditFactory: cellEditFactory,
     cellEditOptions: {
       mode: 'click',
       beforeSaveCell:async (oldValue, newValue, row, column, done, thisV) => {
         if (newValue !== oldValue) {
           const limNew=thisV.props.obj.apiData.lims[thisV.props.obj.paramGroup.user],
                 newTime=parse(newValue, 'HH:mm:ss', new Date());
           limNew.sys.TIME_ALL=newTime.getHours()*3600+newTime.getMinutes()*60+newTime.getSeconds();
           api.control.saveLim(thisV.props.obj.paramGroup.user,limNew);
         }
       },
       blurToSave: true,
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

  const tableAPIprocObj={
    stateLoadObj:refLoading,
     tableContainerClass:'max-content',
     bodyClasses:'body_row_dblclick',
     tab_id:"tab2",
     paramGroup:paramGroup,
     parParentID:['user','date'],
     keyField:'name',
    columns:[
      {dataField:'name',text:'Наименование',headerAttrs: (column, colIndex) => ({ 'width': `150px` }),
       editable:false,
       filter: textFilter({
         delay: 1000,
         placeholder: '...',
       })},
      {dataField:'pid',text:'PID',headerAttrs: (column, colIndex) => ({ 'width': `100px` }),
       editable:false,
       filter: textFilter({
         delay: 1000,
         placeholder: '...',
       })},
      {dataField:'timeAllDelta',text:'Время, потраченное на окно процесса',headerAttrs: (column, colIndex) => ({ 'width': `150px` }),editable:false},
      {dataField:'lim',text:'Ограничение',headerAttrs: (column, colIndex) => ({ 'width': `150px` }),
       editorRenderer: (editorProps, value, row, column, rowIndex, columnIndex) =>
        <QualityTime { ...editorProps } value={ value }/>
      },
      {dataField:'access',text:'Разрешение на запуск процесса',headerAttrs: (column, colIndex) => ({ 'width': `100px` }),editable:false},
    ],
    beforeGetAPI:(thisV,parForAPI,prevProps)=>{
      if (thisV.props.obj.apiData===prevProps.apiData) {
        return false;
      }
      else {
        return true;
      }
    },
    apiData:apiData,
    apiDataFunc:async (data,params,thisV)=>{
      if (!!data.lims) {
        const res=[];
        let proc;
        if (!!data.lims[params.user]) {
          if (!!data.lims[params.user].proc) {
            proc={};
            data.lims[params.user].proc.forEach((item,i) => {
                proc[item.PRC_NAME]={
                  lim:(item.LIM<86400)?secondstotime((item.LIM*1000),0,true,true):'23:59:59',
                  index:i
                };

            });
          }
        }
        if (!!data.data) {
          if (!!data.data.winsActiveSum) {
          for (var key in data.data.winsActiveSum) {
            const winsActiveSum={...data.data.winsActiveSum[key]};
            winsActiveSum.timeAllDelta=secondstotime(winsActiveSum.timeAllDelta,0,true,true);
            winsActiveSum.name=key;
            winsActiveSum.lim='';
            winsActiveSum.limIndex=-777;
            winsActiveSum.access=(winsActiveSum.access)?'Да':'Нет';
            if (!!proc) {
              if (!!proc[key]) {
                  winsActiveSum.lim=proc[key].lim;
                  winsActiveSum.limIndex=proc[key].index;
                  delete proc[key];
              }
            }
            res.push(winsActiveSum);
          }
        }
        }
        if (!!proc) {
          for (var key in proc) {
            res.push({
                name:key,
                pid:'',
                timeAllDelta:'',
                lim:proc[key].lim,
                limIndex:proc[key].index,
                access:'Да'
            });
          }
        }
        return res;
      }
      else {
        return [];
      }
    },
    //действия панели таблицы
    cellEditFactory: cellEditFactory,
    cellEditOptions: {
      mode: 'click',
      beforeSaveCell:async (oldValue, newValue, row, column, done, thisV) => {
        if (newValue !== oldValue) {
          const limNew=thisV.props.obj.apiData.lims[thisV.props.obj.paramGroup.user],
                newTime=parse(newValue, 'HH:mm:ss', new Date()),
                seconds=newTime.getHours()*3600+newTime.getMinutes()*60+newTime.getSeconds();
          if (row.limIndex===-777) {
              limNew.proc.push({
                  PRC_NAME:row.name,
                  LIM:seconds
              });
              row.limIndex=limNew.proc.length-1;
          }
          else {
            limNew.proc[row.limIndex].LIM=seconds;
          }
          api.control.saveLim(thisV.props.obj.paramGroup.user,limNew);
        }
      },
      blurToSave: true,
    },
   paginationFactory:paginationFactory,
   paginationOptions:{
     paginationSize: 7,
     sizePerPageList: [
       {text: '50', value: 50},
       {text: '100', value: 100},
       {text: '250', value:250},
       {text: '500', value:500}
     ]
   },
   filterFactory:filterFactory
 };

 const tableAPIurlObj={
   stateLoadObj:refLoading,
    tableContainerClass:'max-content',
    bodyClasses:'body_row_dblclick',
    tab_id:"tab3",
    paramGroup:paramGroup,
    keyField:'name',
   columns:[
     {dataField:'name',text:'Хост',headerAttrs: (column, colIndex) => ({ 'width': `200px` }),
      filter: textFilter({
        delay: 1000,
        placeholder: '...',
      })},
     {dataField:'timeAll',text:'Время, потраченное на хост',headerAttrs: (column, colIndex) => ({ 'width': `150px` })},
     {dataField:'urls',text:'URL',headerAttrs: (column, colIndex) => ({ 'width': `600px` }),
      filter: textFilter({
        delay: 1000,
        placeholder: '...',
      })},
   ],
   beforeGetAPI:(thisV,parForAPI,prevProps)=>{
     if (thisV.props.obj.apiData===prevProps.apiData) {
       return false;
     }
     else {
       return true;
     }
   },
   apiData:apiData,
   apiDataFunc:async (data,params,thisV)=>{
     if ((!!data.lims) & (!!data.data)) {
       const res=[];
       if (!!data.data.browser) {
         for (var key in data.data.browser) {
           const oneHost={...data.data.browser[key]};
           oneHost.timeAll=secondstotime(oneHost.timeAll,0,true,true);
           oneHost.urls=oneHost.urls.join(';\n')
           res.push({
               ...{name:key},
               ...oneHost
           });
         }
       }
       return res;
     }
     else {
       return [];
     }
   },
   //действия панели таблицы
  paginationFactory:paginationFactory,
  paginationOptions:{
    paginationSize: 7,
    sizePerPageList: [
      {text: '50', value: 50},
      {text: '100', value: 100},
      {text: '250', value:250},
      {text: '500', value:500}
    ]
  },
  filterFactory:filterFactory
};

  const inputDateObj={
    label:'Дата',
    id:"date",
    type:'date',
    defaultValue:format(tekDate,'yyyy-MM-dd'),
    paramGroup:paramGroup,
    setParamGroup:setParamGroup,
    parChealdID:"date",
    apiData:apiData,
    setApiData:setApiData,
    onChange:async (event,thisV)=>{
      const newObj = { ...thisV.props.obj.paramGroup },
            formatDate=format(new Date(event.target.value),'dd-MM-yyyy');
      newObj[thisV.props.obj.parChealdID]=formatDate;
      thisV.props.obj.setParamGroup(newObj);
      thisV.setState({value:event.target.value});
      refLoading.current.handleShow();
      const res=await api.control.getData(newObj.user,formatDate),
            newApiData={...apiData};
      newApiData.data=res;
      thisV.props.obj.setApiData(newApiData);
      refLoading.current.handleHide();
    }
  };

  const handleAddUser=()=>{
    const getWin=(type)=>{
      if (type==='tableAddUser') {
        const handleDelUsrOS=(thisV)=>{
          if (typeof thisV.state.selectRow!=='undefined') {
              const refInputUdPwd=createRef();
              refWinModal2.current.setState({
                modalShow:true,
                size:'lg',
                header:'Удаление пользователя из ОС',
                nextButtonLabel:'Удалить',
                handleButtonNext:async (thisV2)=>{
                    const res=await api.control.delUserOS(refInputUdPwd.current.state.value,thisV.state.rows[thisV.state.selectRow].LOGIN);
                    if (res.delOk) {
                        refAlertPlus.current.handleShow(`Пользователь "${thisV.state.rows[thisV.state.selectRow].LOGIN}" успешно удален из ОС`);
                        const newRows=[...thisV.state.rows];
                        newRows.splice(thisV.state.selectRow,1);
                        thisV.setState({rows:newRows,selectRow:undefined});
                        thisV2.setState({modalShow:false});
                    }
                    else {
                        refAlertPlus.current.handleShow('При удалении пользователя из ОС произошла ошибка:\n'+res.text);
                    }
                },
                body:<Container fluid>
                        <Row>
                          {`Для удаления пользователя "${thisV.state.rows[thisV.state.selectRow].LOGIN}" из ОС необходимо ввести пароль текущего пользователя`}
                        </Row>
                        <Row>
                          <Col>
                            <BootstrapInput ref={refInputUdPwd} obj={{
                              label:'Пароль',
                              id:"pwdUdel",
                              type:'password',
                            }}/>
                          </Col>
                        </Row>
                      </Container>
              });
          }
          else {
              refAlertPlus.current.handleShow('Необходимо кликом левой мыши выбрать пользователя');
          }
        }

        const refWinModal2=createRef();
        const tableAddUserObj={
          stateLoadObj:refLoading,
          tableContainerClass:'max-content',
          bodyClasses:'body_row_dblclick',
          tab_id:"tab4",
          paramGroup:paramGroup,
          apiData:apiData,
          setApiData:setApiData,
          keyField:'UID',
          columns:[
            {dataField:'LOGIN',text:'Логин',headerAttrs: (column, colIndex) => ({ 'width': `200px` }),
              filter: textFilter({
                delay: 1000,
                placeholder: '...',
              })},
            {dataField:'GNAME',text:'Наименование группы',headerAttrs: (column, colIndex) => ({ 'width': `200px` }),
              filter: textFilter({
                delay: 1000,
                placeholder: '...',
              })}
          ],
          beforeGetAPI:(thisV,parForAPI,prevProps)=>{
            const res=[];
            for (var key in thisV.props.obj.apiData.lims) {
                res.push(key);
            }
            parForAPI.users=res;
            return true;
          },
          apiMethod:'control.getUsers',
          //действия панели таблицы
          addRow:(thisV) => {
            //refWinModal.current.setState(getWinModalUser('add'));
            //tekWin=refWinModal.current.state;
            refWinModal.current.setState(getWin('addUserLinux'));
          },
          deleteRow:(thisV) => {
            handleDelUsrOS(thisV);
          },
          //console.log(refTabUsrAdd.current.state.selectRow);
          rowEvents:{
            onDoubleClick:async (e, row, rowIndex,thisV)=>{
                const lim={
                          sys:{"TIME_ALL":86399,"REP_USERS_CONTROL_ID":row.UID},
                          proc:[]
                      },
                      res=await api.control.saveLim(row.LOGIN,lim);
                if (res) {
                    refAlertPlus.current.handleShow(`Пользователь "${row.LOGIN}" добавлен для контроля`);
                    const newRows=[...thisV.state.rows];
                    newRows.splice(rowIndex,1);
                    thisV.setState({rows:newRows,selectRow:undefined});
                    const newApiData={...thisV.props.obj.apiData};
                    newApiData.lims={...newApiData.lims};
                    newApiData.lims[row.LOGIN]=lim;
                    thisV.props.obj.apiData=newApiData;
                    thisV.props.obj.setApiData(newApiData);
                }
                else {
                    refAlertPlus.current.handleShow('Ошибка при сохранении данных');
                }
            }
          },
          selectRowProp:{
            mode: 'radio',
            clickToSelect: true,
            hideSelectColumn: true,
            bgColor: '#00BFFF'
          },
          paginationFactory:paginationFactory,
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
          filterFactory:filterFactory
        };
        return {
          modalShow:true,
          header:'Добавление контролируемого пользователя',
          nextButtonDisplay:'none',
          handleButtonCancel:undefined,
          body:<Container fluid>
                  <WinModal ref={refWinModal2}/>
                  <Row>
                    <Col>
                      <TableAPI obj={tableAddUserObj} ref={refTabUsrAdd}/>
                    </Col>
                  </Row>
                </Container>
        };
      }
      else if (type==='addUserLinux') {
        return {
          modalShow:true,
          header:'Добавление пользователя ОС',
          nextButtonLabel:'Добавить',
          nextButtonDisplay:'block',
          handleButtonNext:async ()=>{
            const res=await api.control.addUserOS(
                refBootInAddUsrL1.current.state.value,
                refBootInAddUsrL2.current.state.value,
                refBootInAddUsrL3.current.state.value,
            );
            if (res.addOk) {
              refWinModal.current.setState(getWin('tableAddUser'));
            }
            else {
                refAlertPlus.current.handleShow('При создании пользователя произошла ошибка:\n'+res.text);
            }
          },
          handleButtonCancel:()=>{
              refWinModal.current.setState(getWin('tableAddUser'));
          },
          body:<Container fluid>
                <Row>
                  <Col>
                    <BootstrapInput obj={{
                      label:'Пароль текущего пользователя',
                      id:"admPwd",
                      type:'password',
                    }} ref={refBootInAddUsrL1}/>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <BootstrapInput obj={{
                      label:'Логин нового пользователя',
                      id:"loginNew"
                    }} ref={refBootInAddUsrL2}/>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <BootstrapInput obj={{
                      label:'Пароль нового пользователя',
                      id:"pwdNew"
                    }} ref={refBootInAddUsrL3}/>
                  </Col>
                </Row>
              </Container>
        };
      }
    }
    refWinModal.current.setState(getWin('tableAddUser'));
  }

  const handleDelUser=()=>{
      if (paramGroup.user!==-777) {
        refConfirmPlus.current.handleShow(
            `Вы действительно хотите удалить пользователя "${paramGroup.user}"`,
            async (val)=>{
                if (val) {
                  const res=await api.control.delUser(paramGroup.user);
                  let resTxt='';
                  if (res.delOk) {
                      const newApiData={...refConfirmPlus.current.props.obj.apiData};
                      newApiData.lims={...newApiData.lims};
                      delete newApiData.lims[paramGroup.user];
                      const newParamGroup={...paramGroup};
                      newParamGroup.user=-777;
                      setParamGroup(newParamGroup);
                      refConfirmPlus.current.props.obj.setApiData(newApiData);
                      resTxt='Пользователь успешно удален';
                  }
                  else {
                      resTxt=`При удалении пользователя произошла ошибка:\n"${res.text}"`;
                  }
                  refAlertPlus.current.handleShow(resTxt);
                }
            }
        );
      }
      else {
        refAlertPlus.current.handleShow(
            'Отсутствуют пользователи для удаления'
        );
      }
  }

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
      <ConfirmPlus
        ref={refConfirmPlus}
        obj={{apiData:apiData,setApiData:setApiData}}
      />
      <WinModal ref={refWinModal}/>
      <Container fluid>
        <Row>
          <Col>
            <MultiselectAPI obj={selectUserObj}/>
            <button style={{background: 'none',border: 'none'}} title="Добавить пользователя" onClick={handleAddUser}><img src={require('../img/add.png')} alt="add user" style={{width:'auto',height:'2.7em'}}/></button>
            <button style={{background: 'none',border: 'none'}} title="Удалить пользователя" onClick={handleDelUser}><img src={require('../img/rep_del.png')} alt="del user" style={{width:'auto',height:'2.7em',marginRight:'0.5em'}}/></button>
          </Col>
          <Col>
            <BootstrapInput obj={inputDateObj}/>
          </Col>
        </Row>
        <Row>
          <Container style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem 3.5rem 1rem 3.5rem',
                margin: '1rem',
                width: 'auto'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Мониторинг и ограничение времени работы в сутки
            </Row>
            <Row>
              <Col>
                <TableAPI obj={tableAPIObj}/>
              </Col>
            </Row>
          </Container>
        </Row>
        <Row>
          <Container style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem 3.5rem 1rem 3.5rem',
                margin: '0 1rem 1rem 1rem',
                width: 'auto'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Мониторинг и ограничения по процессам
            </Row>
            <Row>
              <Col>
                <TableAPI obj={tableAPIprocObj}/>
              </Col>
            </Row>
          </Container>
        </Row>
        <Row>
          <Container style={{
                border:'1px solid black',
                borderRadius:'0.5rem',
                padding: '1rem 3.5rem 1rem 3.5rem',
                margin: '0 1rem 1rem 1rem',
                width: 'auto'
               }}>
            <Row style={{fontSize:'16px',fontWeight:800,padding:'0 1rem'}}>
              Мониторинг посещения сайтов
            </Row>
            <Row>
              <Col>
                <TableAPI obj={tableAPIurlObj}/>
              </Col>
            </Row>
          </Container>
        </Row>
      </Container>
    </div>
  );
}

export default Control;
