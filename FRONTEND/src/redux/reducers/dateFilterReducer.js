import { SET_DATE_FILTER } from '../actions/dateFilterActions';

const initialState = {
  filter: 'today',
};

const dateFilterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_DATE_FILTER:
      return {
        ...state,
        filter: action.payload,
      };
    default:
      return state;
  }
};

export default dateFilterReducer;
