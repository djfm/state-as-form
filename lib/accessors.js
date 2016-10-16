export const removePropName = (...propNames) => props =>
  Object.assign({}, ...Object.keys(props).map(
    propName => (propNames.includes(propName) ? {} : {
      [propName]: props[propName],
    })
  ));

const findKey = name => object => {
  if (object && typeof name === 'function') {
    for (const key of Object.keys(object)) {
      if (name(object[key])) {
        return key;
      }
    }

    throw new Error('prop selector did not match');
  }

  return name;
};

const isArray = object =>
  Object.prototype.toString.call(object) === '[object Array]';

export const prop = (name, ...deeper) => {
  const p = {
    get: object =>
      (object || {})[findKey(name)(object)],

    set: value => object => {
      const key = findKey(name)(object);

      if (isArray(object)) {
        return object.slice(0, +key).concat(value, object.slice(+key + 1));
      }

      return Object.assign(
        {}, object, { [key]: value }
      );
    },

    delete: object => {
      const key = findKey(name)(object);

      if (isArray(object)) {
        return object.slice(0, +key).concat(object.slice(+key + 1));
      }

      return removePropName(key)(object);
    },
  };

  if (deeper.length === 0) {
    return p;
  }

  const q = prop(...deeper);
  return {
    get: object => q.get(p.get(object)),
    set: value => object =>
      p.set(q.set(value)(p.get(object)))(object),
    delete: object =>
      p.set(q.delete(p.get(object)))(object),
  };
};
