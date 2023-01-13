import {
  ADD_VALIDATION,
  CLEAR_VALIDATION
} from './types';

export const setValidation = (val) => dispatch => {
  dispatch({
    type: ADD_VALIDATION,
    payload: val
  });
};

export const clearValidation = () => dispatch => {
  dispatch({ type: CLEAR_VALIDATION });
};

