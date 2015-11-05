import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';

@connect(state => ({ devices: state.devices.coordinators }))
export default class Devices extends Component {
  static propTypes = {
    devices: PropTypes.array.isRequired,
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-3"></div>
          <div className="col-md-6">
            {this.props.devices.map((device) => {
              return <h3 key={device.ip}>{device.ip}</h3>;
            })}
          </div>
          <div className="col-md-3"></div>
        </div>
      </div>
    );
  }
}
