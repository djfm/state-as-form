import { SET_FIELD_VALUE } from './actions';

import { prop } from './accessors';

export const reducer = (state = {}, action) => {
  if (action.type === SET_FIELD_VALUE) {
    return prop(...action.path).set(action.value)(state);
  }

  return state;
};
