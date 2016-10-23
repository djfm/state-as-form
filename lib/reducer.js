import { SET_FIELD_VALUE, UPDATE_FIELD_VALUE } from './actions';

import { prop } from './accessors';

export const reducer = (state = {}, action) => {
  if (action.type === SET_FIELD_VALUE) {
    return prop(...action.path).set(action.value)(state);
  }

  if (action.type === UPDATE_FIELD_VALUE) {
    const accessor = prop(...action.path);
    return accessor.set(action.update(accessor.get(state)))(state);
  }

  return state;
};
