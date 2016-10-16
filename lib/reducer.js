import { PROP_SET } from './actions';

import { prop } from './accessors';

export const reducer = (state = {}, action) => {
  if (action.type === PROP_SET) {
    return prop(...action.path).set(action.value)(state);
  }

  return state;
};
