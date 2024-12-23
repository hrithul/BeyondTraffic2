// Action Types
export const SET_DEVICE_FILTER = 'SET_DEVICE_FILTER';
export const CLEAR_DEVICE_FILTER = 'CLEAR_DEVICE_FILTER';

// Action Creators
export const setDeviceFilter = (filter) => ({
  type: SET_DEVICE_FILTER,
  payload: filter
});

export const clearDeviceFilter = () => ({
  type: CLEAR_DEVICE_FILTER
});
