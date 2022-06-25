import React from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

class Loading extends React.Component {
  constructor(props) {
      super(props);
      //console.log('props',props);
      this.handleShow = this.handleShow.bind(this);
      this.handleHide = this.handleHide.bind(this);
      this.state = {
        vis:0
      };
  }

  handleShow() {
    this.setState((state) => ({vis:++state.vis}));
  }

  handleHide() {
    this.setState((state) => ({vis:--state.vis}));
  }

  render() {
      return (
        <div className="divLoading" style={ (this.state.vis>0)? {display:'block'}:{display:'none'} }>
          <ProgressBar animated now={0} />
        </div>
      );    
  }
}

export default Loading;
