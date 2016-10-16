export const shallowEqual = a => b => {
  if (typeof a !== typeof b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  if (typeof a !== 'object') {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const aKey of aKeys) {
    if (!shallowEqual(a[aKey])(b[aKey])) {
      return false;
    }
  }

  return true;
};
