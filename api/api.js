require('../server.babel'); // babel registration (runtime transpilation for node)

import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import config from '../src/config';
import * as actions from './actions/index';
import {mapUrl} from 'utils/url.js';
import PrettyError from 'pretty-error';
import http from 'http';
import SocketIo from 'socket.io';

import Sonos from 'sonos';

const pretty = new PrettyError();
const app = express();

const server = new http.Server(app);

const io = new SocketIo(server);
io.path('/ws');

app.use(session({
  secret: 'react and redux rule!!!!',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
app.use(bodyParser.json());

app.use((req, res) => {

  const splittedUrlPath = req.url.split('?')[0].split('/').slice(1);

  const {action, params} = mapUrl(actions, splittedUrlPath);

  if (action) {
    action(req, params)
      .then((result) => {
        res.json(result);
      }, (reason) => {
        if (reason && reason.redirect) {
          res.redirect(reason.redirect);
        } else {
          console.error('API ERROR:', pretty.render(reason));
          res.status(reason.status || 500).json(reason);
        }
      });
  } else {
    res.status(404).end('NOT FOUND');
  }
});


const bufferSize = 100;
const messageBuffer = new Array(bufferSize);
let messageIndex = 0;

const devices = new Map();
const coordinators = new Map();

function getBridgeDevices (deviceList) {
  var bridgeDevices = []
  deviceList.forEach(function (device) {
    if (device.CurrentZoneName === 'BRIDGE') {
      bridgeDevices.push(device)
    }
  })
  return bridgeDevices
}

function getZones (deviceList) {
  const zones = [];
  deviceList.forEach(function (device) {
    if (zones.indexOf(device.CurrentZoneName) === -1 && device.CurrentZoneName !== 'BRIDGE') {
      zones.push(device.CurrentZoneName);
    }
  })
  return zones;
}

function getZoneDevices (zone, deviceList) {
  const zoneDevices = [];
  deviceList.forEach(function (device) {
    if (device.CurrentZoneName === zone) {
      zoneDevices.push(device);
    }
  })
  return zoneDevices;
}

function getZoneCoordinator (zone, deviceList) {
  let coordinator;
  deviceList.forEach(function (device) {
    if (device.CurrentZoneName === zone && device.coordinator === 'true') {
      coordinator = device;
    }
  })
  return coordinator;
}

if (config.apiPort) {
  const runnable = app.listen(config.apiPort, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', config.apiPort);
    console.info('==> 💻  Send requests to http://%s:%s', (process.env.HOST || 'localhost'), config.apiPort);
  });

  var search = Sonos.search();

  search.on('DeviceAvailable', function (device, model) {
    var data = {ip: device.host, port: device.port, model: model}

    device.deviceDescription((err, description) => {
      if (!err) {
        Object.assign(data, description);
      }
      device.getZoneAttrs((err, attrs) => {
        if (!err) {
          Object.assign(data, attrs);
        }
        device.getZoneInfo((err, info) => {
          if (!err) {
            Object.assign(data, info);
          }
          device.getTopology((err, info) => {
            if (!err) {
              info.zones.forEach((group) => {
                if (group.location === 'http://' + data.ip + ':' + data.port + '/xml/device_description.xml') {
                  Object.assign(data, group);
                }
              });
            }
            device.getVolume((err, volume) => {
              if (!err) {
                Object.assign(data, {volume: volume});
              }
              device.getMuted((err, muted) => {
                if (!err) {
                  Object.assign(data, {muted: muted});
                }
                device.getLEDState((err, led) => {
                  if (!err) {
                    Object.assign(data, {led: led});
                  }
                  device.getCurrentState((err, state) => {
                    if (!err) {
                      Object.assign(data, {state: state});
                    }
                    device.currentTrack((err, track) => {
                      if (!err) {
                        Object.assign(data, {track: track});
                      }

                      devices.set(data.ip, data);
                      io.emit('devices', Array.from(devices.values()));

                      coordinators.clear();
                      getZones(Array.from(devices.values())).forEach((zone) => {
                        const coordinator = getZoneCoordinator(zone, Array.from(devices.values()));
                        if (coordinator !== undefined) {
                          coordinators.set(coordinator.ip, coordinator);
                        }
                      });
                      io.emit('coordinators', Array.from(coordinators.values()));
                    });
                  });
                });
              });
            });
          });
        });
      });
    })
  });

  io.on('connection', (socket) => {
    socket.emit('coordinators', Array.from(coordinators.values()));
    socket.emit('devices', Array.from(devices.values()));

    socket.emit('news', {msg: `'Hello World!' from server`});

    socket.on('history', () => {
      for (let index = 0; index < bufferSize; index++) {
        const msgNo = (messageIndex + index) % bufferSize;
        const msg = messageBuffer[msgNo];
        if (msg) {
          socket.emit('msg', msg);
        }
      }
    });

    socket.on('msg', (data) => {
      data.id = messageIndex;
      messageBuffer[messageIndex % bufferSize] = data;
      messageIndex++;
      io.emit('msg', data);
    });
  });
  io.listen(runnable);

} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
