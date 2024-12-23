import { combineReducers } from 'redux';
import dateFilterReducer from './dateFilterReducer';
import deviceFilterReducer from './deviceFilterReducer';

const rootReducer = combineReducers({
  dateFilter: dateFilterReducer,
  deviceFilter: deviceFilterReducer
});

export default rootReducer;
