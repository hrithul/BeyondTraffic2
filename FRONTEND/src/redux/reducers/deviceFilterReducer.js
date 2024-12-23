import { SET_DEVICE_FILTER, CLEAR_DEVICE_FILTER } from '../actions/deviceFilterActions';

// Initial state with empty selectedDevices object
const initialState = {
  selectedDevices: {},
  selectedOrg: null,
  selectedRegions: [],
  selectedStores: []
};

const deviceFilterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DEVICE_FILTER:
      return {
        ...state,
        ...action.payload
      };
    case CLEAR_DEVICE_FILTER:
      return initialState;
    default:
      return state;
  }
};

export default deviceFilterReducer;
