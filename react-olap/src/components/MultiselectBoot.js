import React from 'react';
import Multiselect from 'react-bootstrap-multiselect';
import {getParamForSQL,getParamDiff,getSQLRun,getDBType} from '../system.js';
import 'react-bootstrap-multiselect/css/bootstrap-multiselect.css';

class MultiselectBoot extends React.Component {
  constructor(props) {
      super(props);
      this.handleDropdownHidden = this.handleDropdownHidden.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleDeselectAll = this.handleDeselectAll.bind(this);
      this.handleSetCheckeds = this.handleSetCheckeds.bind(this);
      let selectOptions;
      if (!this.multiple) {
        selectOptions=props.obj.options[0].value;
        for (var i = 0; i < props.obj.options.length; i++) {
          if (props.obj.options[i].selected) {
             selectOptions=props.obj.options[i].value;
             break;
          }
        }
      }
      else {
        selectOptions=[];
        for (var i = 0; i < props.obj.options.length; i++) {
          if (props.obj.options[i].selected) {
             selectOptions.push(props.obj.options[i].value)
          }
        }
      }

      this.state = {
        options: props.obj.options,
        checkedOptions: selectOptions
      }
      this.type=typeof props.obj.options[0].value;
      this.multiple=false;
      if (typeof props.obj.multiple==='boolean') {
          this.multiple=props.obj.multiple;
      }
      if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
        let newObj = { ...this.props.obj.paramGroup };
        newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
        this.props.obj.setParamGroup(newObj);
      }
  }

  handleChange(option, checked) {
    const optionValue=(this.type==='number')?+option[0].value:option[0].value;
    if (checked) {
       if (this.multiple) {
         if (this.state.checkedOptions.length===0) {
            this.setState({checkedOptions:[optionValue]});
         }
         else {
           this.setState({checkedOptions: [...this.state.checkedOptions, optionValue]});
         }
       }
       else {
          this.setState({checkedOptions:optionValue});
       }
    }
    else {
      if (this.multiple) {
        this.setState({checkedOptions: this.state.checkedOptions.filter(x => x !== optionValue)});
      }
    }
    if ((!!this.props.obj.paramGroup) & (!!this.props.obj.setParamGroup)) {
      let newObj = { ...this.props.obj.paramGroup };
      newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
      this.props.obj.setParamGroup(newObj);
    }
  }

  handleSetCheckeds(value) {
    const newOptions=[...this.state.options];
    if (!this.multiple) {
      newOptions.forEach((item, i) => {
          newOptions[i].checked=false;
          if (item.value===value) {
              newOptions[i].checked=true;
          }
      });
    }
    else {
      newOptions.forEach((item, i) => {
          newOptions[i].checked=false;
          for (var j = 0; j < value.length; i++) {
            if (value[j]===item.value) {
              newOptions[i].checked=true;
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
      newObj[this.props.obj.parChealdID]=this.state.checkedOptions;
      this.props.obj.setParamGroup(newObj);
    }
  }

  componentDidMount() {
      if (!!this.props.obj.componentDidMount) {
          this.props.obj.componentDidMount(this)
      }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
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

export default MultiselectBoot;
