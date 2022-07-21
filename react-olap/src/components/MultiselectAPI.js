import React from 'react';
import Multiselect from 'react-bootstrap-multiselect';
import {getParamForAPI,getParamDiff} from '../system.js';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';
import {apiStr} from '../ws.js';

class MultiselectAPI extends React.Component {
  constructor(props) {
      super(props);
      this.handleDropdownHidden = this.handleDropdownHidden.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleDeselectAll = this.handleDeselectAll.bind(this);
      this.handleSetCheckeds = this.handleSetCheckeds.bind(this);
      this.optionsDef= [{'value':-888,'label':'Значения отсутствуют'}];
      this.multiple=false;
      if (typeof props.obj.multiple==='boolean') {
          this.multiple=props.obj.multiple;
      }
      this.state = {
        options:this.optionsDef,
        checkedOptions: undefined,
        styleBMC:(!!this.props.obj.styleBMC)?this.props.obj.styleBMC: undefined
      }
      this.getOptionsByAPI = this.getOptionsByAPI.bind(this);
  }

  handleChange(option, checked) {
    const optionValue=(this.typeValue==='number')?+option[0].value:option[0].value;
    if (checked) {
       if (!this.multiple) {
        this.setState({
          checkedOptions: optionValue
        });
        //для единичного выбора обрабатываем изменение параметров формы здесь
        if ((!!this.props.obj.parChealdID) & (!!this.props.obj.setParamGroup) & (!!this.props.obj.paramGroup)) {
            let newObj = { ...this.props.obj.paramGroup };
            newObj[this.props.obj.parChealdID]=optionValue;
            this.props.obj.setParamGroup(newObj);
        }
      }
      else {
         if (this.state.checkedOptions===undefined) {
            this.setState({checkedOptions:[optionValue]});
         }
         else {
           this.setState({checkedOptions: [...this.state.checkedOptions, optionValue]});
        }
      }
    }
    else {
      if (this.multiple) {
        this.setState({checkedOptions: this.state.checkedOptions.filter(x => x !== optionValue)});
      }
    }
    if (!!this.props.obj.handleChange) {
        this.props.obj.handleChange(option, checked, this);
    }
  }

  handleSetCheckeds(value) {
    const newOptions=[...this.state.options];
    if (!this.multiple) {
      newOptions.forEach((item, i) => {
          delete newOptions[i].selected;
          if (item.value===value) {
              newOptions[i].selected=true;
          }
      });
    }
    else {
      newOptions.forEach((item, i) => {
          delete newOptions[i].selected;
          for (var j = 0; j < value.length; i++) {
            if (value[j]===item.value) {
              newOptions[i].selected=true;
              value.splice(j, 1);
              break;
            }
          }
      });
    }
    this.setState({
      options:newOptions,
      checkedOptions:value
    });
    if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
      let newObj = { ...this.props.obj.paramGroup };
      newObj[this.props.obj.parChealdID]=value;
      this.props.obj.setParamGroup(newObj);
    }
  }

  getOptionsByAPI(prevProps) {
    if (this.props.obj.stateLoadObj.current!==null) {
      this.props.obj.stateLoadObj.current.handleShow();
    }
    const thisV=this;
    var data = {params:{}};
    const parForAPI=getParamForAPI(thisV.props.obj);
    let prOk=true;
    if (!!thisV.props.obj.beforeGetAPI) {
        prOk=thisV.props.obj.beforeGetAPI(thisV,parForAPI,prevProps);
    }
    if (prOk) {
      const setRes=(res)=>{
        const setDefault=()=>{
          this.setState({
            options:this.optionsDef
          });
          this.typeValue='number'
          if (!this.multiple) {
            this.state.checkedOptions=this.optionsDef[0].value;
          }
          else {
            this.state.checkedOptions=[];
          }
        }
        let selectedDefault;
        if (Array.isArray(res)) {
          if (res.length>0) {
              this.setState({options:res});
              this.typeValue=((typeof res[0].value==='number')?'number':'string')
              if (!this.multiple) {
                  selectedDefault=res[0];
                  //если присутствует поле selected
                  if (typeof res[0].selected!=='undefined') {
                    for (var i = 0; i < res.length; i++) {
                      if (+res[i].selected===1) {
                        selectedDefault=res[i];
                        break;
                      }
                    }
                  }
                  this.state.checkedOptions=selectedDefault.value;
              }
              else {
                  selectedDefault=[];
                  //если присутствует поле selected
                  if (typeof res[0].selected!=='undefined') {
                    for (var i = 0; i < res.length; i++) {
                      if (+res[i].selected===1) {
                        selectedDefault.push(res[i].value);
                      }
                    }
                  }
                  this.state.checkedOptions=selectedDefault;
              }
          }
          else {
              setDefault();
          }
        }
        else {
          setDefault();
        }
        if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
          const newObj = { ...this.props.obj.paramGroup };
          newObj[this.props.obj.parChealdID]=selectedDefault.value;
          this.props.obj.setParamGroup(newObj);
        }
        if (!!this.props.obj.afterLoadData) {
            this.props.obj.afterLoadData(this,res);
        }
        if (this.props.obj.stateLoadObj.current!==null) {
          this.props.obj.stateLoadObj.current.handleHide();
        }
      }
      const getApi=async ()=>{
        //console.log(apiStr);
        if (!!this.props.obj.apiMethod) {
          const res=await apiStr[thisV.props.obj.apiMethod](parForAPI);
          setRes(res);
        }
        else if (!!this.props.obj.apiDataFunc) {
            const res=await this.props.obj.apiDataFunc(this.props.obj.apiData,parForAPI,this,prevProps);
            setRes(res);
        }
      }
      if ((typeof apiStr[thisV.props.obj.apiMethod]==='function') || (!!thisV.props.obj.apiDataFunc)) {
          getApi();
      }
      else if (typeof thisV.props.obj.apiMethod==='string') {
          const timerId = setInterval(() => {
            if (typeof apiStr[thisV.props.obj.apiMethod]==='function') {
              clearInterval(timerId);
              getApi();
            }
          }, 100);
      }

    }
    else if (this.props.obj.stateLoadObj.current!==null) {
      this.props.obj.stateLoadObj.current.handleHide();
    }
    /*getSQLRun(data,(response)=> {
      const setDefault=()=>{
        this.setState({
          options:this.optionsDef
        });
        if (!this.multiple) {
          this.state.checkedOptions=this.optionsDef[0].value;
        }
        else {
          this.state.checkedOptions=[];
        }
      }
      if (!!res) {
        if (res.length>0) {
            this.type=((typeof res[0].value==='number')?'number':'string');
            this.setState({options:res});
            let selectedDefault,
                selectedDefaultLabel;
            if (!this.multiple) {
                selectedDefault=res[0];
                //если присутствует поле selected
                if (typeof res[0].selected!=='undefined') {
                  for (var i = 0; i < res.length; i++) {
                    if (+res[i].selected===1) {
                      selectedDefault=res[i];
                      break;
                    }
                  }
                }
                this.state.checkedOptions=selectedDefault.value;
            }
            else {
                selectedDefault=[];
                selectedDefaultLabel=[];
                //если присутствует поле selected
                if (typeof res[0].selected!=='undefined') {
                  for (var i = 0; i < res.length; i++) {
                    if (+res[i].selected===1) {
                      selectedDefault.push(res[i].value);
                      selectedDefaultLabel.push(res[i].label);
                    }
                  }
                }
                this.state.checkedOptions=selectedDefault;
            }
        }
        else {
            setDefault();
        }
      }
      else {
        setDefault();
      }
      if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
        let newObj = { ...this.props.obj.paramGroup };
        newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
        this.props.obj.setParamGroup(newObj);
      }
      if (!!this.props.obj.afterLoadSQL) {
          this.props.obj.afterLoadSQL(this,response);
      }
    },
      val.props.obj.stateLoadObj
    );*/

  }

  componentDidMount() {
      if ((!!!this.props.obj.parParentID) & (!!this.props.obj.apiMethod)) {
          this.getOptionsByAPI();
      }
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this);
      }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    //if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
    if (getParamDiff(this.props.obj,prevProps.obj)) {
          this.getOptionsByAPI(prevProps.obj);
    }
    else if ((!!this.props.obj.apiData) & (!!this.props.obj.apiDataFunc)) {
        if (this.props.obj.apiData!==prevProps.obj.apiData) {
            this.getOptionsByAPI(prevProps.obj);
        }
    }
    if (!!this.props.obj.componentDidUpdate) {
        this.props.obj.componentDidUpdate(this,prevProps, prevState, snapshot);
    }
  }

  handleDropdownHidden() {
    if (!!this.state.checkedOptions){
      if ((!!this.props.obj.parChealdID) & (!!this.props.obj.setParamGroup) & (!!this.props.obj.paramGroup)) {
          let newObj = { ...this.props.obj.paramGroup };
          newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
          this.props.obj.setParamGroup(newObj);
      }
    }
  }

  handleSelectAll() {
    let value=[];
    this.state.options.forEach(function(item) {
      value.push(item.value);
    })
    this.setState({checkedOptions:value});
  }

  handleDeselectAll() {
    this.setState({checkedOptions:[]});
  }

  render() {
    return (
      <div className="bootstrapMultiselectContainer" id={this.props.obj.divID} style={this.state.styleBMC}>
        <label className="labelForBootstrapMultiselect">{ this.props.obj.label }</label>
        <Multiselect
          data={this.state.options}
          includeSelectAllOption={true}
          enableFiltering={true}
          enableCaseInsensitiveFiltering={true}
          templates= {{filterClearBtn: '<span class="input-group-btn"><button class="btn btn-default multiselect-clear-filter" type="button">&#128269;</button></span>'}}
          onChange={this.handleChange}
          filterPlaceholder= 'Поиск'
          multiple={ this.multiple }
          selectAllText="Выбрать все"
          nonSelectedText="Ничего не выбрано"
          onDropdownHidden={ this.handleDropdownHidden }
          allSelectedText="Выбраны все"
          onSelectAll={ this.handleSelectAll }
          onDeselectAll={ this.handleDeselectAll }
          nSelectedText="значени(й/я)"
          id={this.props.obj.id}
        />
      </div>
    );
  }
}

export default MultiselectAPI;
