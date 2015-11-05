import React, { Component, PropTypes } from 'react';

export default class Device extends Component {
  static propTypes = {
    device: PropTypes.object.isRequired,
  }

  render() {
    return <li onClick={() => {console.log(this.props.device.ip);}} key={this.props.device.ip}><a href="#">{this.props.device.CurrentZoneName}</a></li>;
  }
}
