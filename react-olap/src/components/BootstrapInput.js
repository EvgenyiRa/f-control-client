import React from 'react';
import FormControl from 'react-bootstrap/FormControl';

class BootstrapInput extends React.Component {
  constructor(props) {
      super(props);
      this.checkRequired = this.checkRequired.bind(this);
      this.state = {
        value:(!!this.props.obj.defaultValue)?this.props.obj.defaultValue:undefined,
        invalidText:(!!this.props.obj.invalidText)?this.props.obj.invalidText:'',
        type:(!!this.props.obj.type)?this.props.obj.type:'text',
        placeholder:(!!this.props.obj.placeholder)?this.props.obj.placeholder:'Введите значение',
        readOnly:(typeof this.props.obj.readOnly==='boolean')?this.props.obj.readOnly:false,
        disabled:(typeof this.props.obj.disabled==='boolean')?this.props.obj.disabled:false,
      };

  }

  checkRequired() {
    let prOk=true;
    if (!!!this.state.value) {
        prOk=false;
    }
    else {
      if (typeof this.state.value==='string') {
        const value=this.state.value.trim();
        if (value==='') {
            prOk=false;
        }
      }
    }
    if ((!prOk) & (this.state.invalidText==='')) {
        this.setState({invalidText:'Поле обязательно к заполнению'});
    }
    else if ((prOk) & (this.state.isInvalid!=='')) {
        this.setState({invalidText:''});
    }
    return prOk;
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

  render() {
    return (
      <div className="bootstrapInputContainer">
        <label htmlFor="basic-url" className="labelBeforeBootstrapInput">{this.props.obj.label}</label>
        <FormControl
            placeholder={this.state.placeholder}
            aria-label={this.state.placeholder}
            aria-describedby="basic-addon2"
            id={this.props.obj.id}
            type={this.state.type}
            defaultValue={this.props.obj.defaultValue}
            value={this.state.value}
            isValid={false}
            isInvalid={(this.state.invalidText==='')?false:true}
            readOnly={this.state.readOnly}
            disabled={this.state.disabled}
            onChange={(event) => {
                        if (!!this.props.obj.onChange) {
                            this.props.obj.onChange(event,this);
                        }
                        else {
                          this.setState({value:event.target.value});
                        }
                     }}
            onBlur={(event) => {
                        if (!!this.props.obj.onBlur) {
                            this.props.obj.onBlur(event,this);
                        }
                     }}
             onKeyDown={(event) => {
                          if (!!this.props.obj.onKeyDown) {
                              this.props.obj.onKeyDown(event,this);
                          }
                       }}
             onKeyPress={(event) => {
                         if (!!this.props.obj.onKeyPress) {
                             this.props.obj.onKeyPress(event,this);
                         }
                      }}
          />
          <FormControl.Feedback type="invalid">
              {this.state.invalidText}
          </FormControl.Feedback>
      </div>
    );
  }
}

export default BootstrapInput;
