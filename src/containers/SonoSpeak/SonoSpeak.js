import React, { Component, PropTypes } from 'react';

import {connect} from 'react-redux';
import { Device } from 'components';

@connect(state => ({ devices: state.devices.coordinators }))
export default class SonoSpeak extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    devices: PropTypes.array.isRequired,
  }

  render() {
    const styles = require('./SonoSpeak.scss');

    return (
      <div className={styles.sonospeak}>

        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="navbar-header">
            <a className="navbar-brand">SonoSpeak</a>
          </div>

          <div className="collapse navbar-collapse">
            <ul className="nav navbar-nav navbar-left">
            <li className="dropdown">
              <a href="#" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Välj enhet<span className="caret"></span></a>
              <ul className="dropdown-menu">
                {this.props.devices.map((device) => {
                  return <Device key={device.ip} device={device}/>;
                })}
              </ul>
            </li>
          </ul>
          </div>
        </nav>

        {this.props.children}
      </div>
    );
  }
}
