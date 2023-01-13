import {
    ADD_VALIDATION,
    CLEAR_VALIDATION
  } from '../actions/types';
  
  const initialState = {
    validations: []
  };
  
  export default function(state = initialState, action) {
    const { type, payload } = action;
    switch (type) {
      case ADD_VALIDATION:
        return  {
            ...state,
            // payload first so it shows first in ui
            validations: [payload, ...state.validations],
        };
      case CLEAR_VALIDATION:
        return  {
            ...state,
            validations: [],
        };
      default:
        return state;
    }
  }
  