const CHANGED_COORDINATORS = 'devices/CHANGED_COORDINATORS';
const CHANGED_DEVICES = 'devices/CHANGED_DEVICES';

const initialState = {
  coordinators: [],
  devices: [],
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case CHANGED_COORDINATORS:
      return {
        ...state,
        coordinators: action.payload,
      };

    case CHANGED_DEVICES:
      return {
        ...state,
        devices: action.payload,
      };


    default:
      return state;
  }
}

export function receivedCoordinators(devices) {
  return {
    type: CHANGED_COORDINATORS,
    payload: devices
  };
}

export function receivedDevices(devices) {
  return {
    type: CHANGED_DEVICES,
    payload: devices
  };
}
