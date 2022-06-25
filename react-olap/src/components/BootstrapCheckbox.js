import React from 'react';
import Form from 'react-bootstrap/Form';
import $ from 'jquery';


class BootstrapCheckbox extends React.Component {
  constructor(props) {
      super(props);
      this.type=(!!this.props.obj.type)?this.props.obj.type:"checkbox";
      this.state = {
        checked:(typeof this.props.obj.beginChecked==='boolean')?this.props.obj.beginChecked:true,
        disabled:(typeof this.props.obj.beginDisabled==='boolean')?this.props.obj.beginDisabled:false,
      };

  }

  render() {
    return (
      <div key={this.props.obj.id} className="mb-3 divRootCheckboxBC">
          <Form.Check
            type={this.type}
            id={this.props.obj.id}
            label={this.props.obj.label}
            disabled={this.state.disabled}
            checked={this.state.checked}
            onChange={(event) => {
              const chb=$(event.target);
              //анимация
              if (!$(chb).is('.change')) {
                $(chb).addClass('change');
                setTimeout(()=>{
                  $(chb).removeClass('change')
                }, 1000);
              }
              if (!!this.props.obj.onChange) {
                  this.props.obj.onChange(event,this)
              }
              else {
                  this.setState({checked:event.target.checked})
              }
            }}
          />
      </div>
    );
  }
}

export default BootstrapCheckbox;
