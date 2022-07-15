import React from 'react';
import Multiselect from 'react-bootstrap-multiselect';
import {getParamForSQL,getParamDiff,getSQLRun,getDBType} from '../system.js';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';

class MultiselectSQL extends React.Component {
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
        checkedOptions: undefined
      }
      this.getOptionsBySQL = this.getOptionsBySQL.bind(this);
      this.dbtype=getDBType();
      this.type=typeof props.obj.options[0].value;
  }

  handleChange(option, checked) {
    const optionValue=(this.type==='number')?+option[0].value:option[0].value;
    if (checked) {
       if (this.state.checkedOptions===undefined) {
          this.setState({checkedOptions:[optionValue]});
       }
       else {
         this.setState({checkedOptions: [...this.state.checkedOptions, optionValue]});
       }
    }
    else {
      this.setState({checkedOptions: this.state.checkedOptions.filter(x => x !== optionValue)});
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

  getOptionsBySQL() {
    const val=this;
    var data = {};
    if (['mysql','pg'].indexOf(this.dbtype)>-1) {
        data.params=[];
    }
    else {
        data.params={};
    }
    data.sql=val.props.obj.sql;
    getParamForSQL(val.props.obj.paramGroup,val.props.obj.parParentID,data);
    getSQLRun(data,(response)=> {
      const setDefault=()=>{
        this.setState({
          options:this.optionsDef
        });
        if (!this.multiple) {
          this.state.checkedOptions=this.stateDefaultOptions[0].value;
        }
        else {
          this.state.checkedOptions=[];
        }
      }
      if (!!response.data) {
        if (response.data.length>0) {
            this.type=((typeof response.data[0].value==='number')?'number':'string');
            this.setState({options:response.data});
            let selectedDefault,
                selectedDefaultLabel;
            if (!this.multiple) {
                selectedDefault=response.data[0];
                //если присутствует поле selected
                if (typeof response.data[0].selected!=='undefined') {
                  for (var i = 0; i < response.data.length; i++) {
                    if (+response.data[i].selected===1) {
                      selectedDefault=response.data[i];
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
                if (typeof response.data[0].selected!=='undefined') {
                  for (var i = 0; i < response.data.length; i++) {
                    if (+response.data[i].selected===1) {
                      selectedDefault.push(response.data[i].value);
                      selectedDefaultLabel.push(response.data[i].label);
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
  );

  }

  componentDidMount() {
      if (!!!this.props.obj.parParentID) {
          this.getOptionsBySQL();
      }
  }

    componentDidUpdate(prevProps, prevState, snapshot) {
      if (getParamDiff(this.props.obj.paramGroup,prevProps.obj.paramGroup,this.props.obj.parParentID)) {
          this.getOptionsBySQL();
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
      <div className="bootstrapMultiselectContainer" id={this.props.obj.divID}>
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

export default MultiselectSQL;
