import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
//

import $ from 'jquery';

class AlertPlus extends React.Component {
  constructor(props) {
      super(props);
      this.handleClick = this.handleClick.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.handleShowFocus = this.handleShowFocus.bind(this);
      this.state = {
        show:false,
        text:'',
        size:'sm',
        callback:undefined
      };
  }

  handleClick() {
    this.setState({show:false,text:''});
    if (!!this.state.callback) {
      this.state.callback(this);
      this.setState({callback:undefined});
    }
  }

  handleShowFocus() {
    $('div.fade.modal.show div.modal-footer button').focus();
  }

  handleShow(textIn,callbackIn,sizeIn) {
      if (!!!sizeIn) {
          sizeIn='sm';
      }
      this.setState({show:true,
                     text:textIn,
                     size:sizeIn,
                     callback:callbackIn
                   });
  }

  render() {
    return (
      <Modal onEntered={ this.handleShowFocus } size={this.state.size} show={ this.state.show } centered onHide={()=>this.handleClick()} aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Сообщение
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          {this.state.text}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={()=>this.handleClick()} variant="primary">OK</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default AlertPlus;
