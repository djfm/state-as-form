import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

const contextTypes = {
  path: PropTypes.arrayOf(PropTypes.string),
};

const withContext = component => {
  const decorated = (props, context) => React.createElement(
    component,
    Object.assign({}, context, props)
  );

  decorated.contextTypes = contextTypes;

  return decorated;
};

export class Form extends Component {
  getChildContext() {
    const { path = [] } = this.context;
    const { name } = this.props;

    return {
      path: path.concat(name),
    };
  }

  render() {
    return React.createElement('div', {}, this.props.children);
  }
}

Form.childContextTypes = contextTypes;

Form.contextTypes = contextTypes;

Form.propTypes = {
  children: PropTypes.node,
  name: PropTypes.string.isRequired,
};

export const prop = (name, ...deeper) => {
  const p = {
    get: object => (object || {})[name],
    set: value => object => Object.assign(
      {}, object, { [name]: value }
    ),
    delete: object => {
      const copy = Object.assign({}, object);
      delete copy[name];
      return copy;
    },
  };

  if (deeper.length === 0) {
    return p;
  }

  const q = prop(...deeper);
  return {
    get: object => q.get(p.get(object)),
    getWithDefault: (object, defaultValue) =>
      q.getWithDefault(p.get(object), defaultValue),
    set: value => object =>
      p.set(q.set(value)(p.get(object)))(object),
    delete: object =>
      p.set(q.delete(p.get(object)))(object),
  };
};

const propSetAction = (...path) => value => ({
  type: 'PROP_SET',
  path,
  value,
});

export const reducer = (state = {}, action) => {
  if (action.type === 'PROP_SET') {
    return prop(...action.path).set(action.value)(state);
  }

  return state;
};

const withAccessor = (...path) => connect(
  state => ({
    value: prop('forms', ...path).get(state),
  }),
  dispatch => ({
    setValue: value => dispatch(
      propSetAction(...path)(value)
    ),
  })
);

export const makeField = component => withContext(({
  path,
  name,
  ...props,
}) => React.createElement(
  withAccessor(...path, name)(component),
  Object.assign({ name }, props)
));

export const Field = makeField(({
  component = 'input',
  type = 'text',
  value,
  setValue,
  ...props,
}) => React.createElement(component, Object.assign({
  type,
  value,
  onChange: event => setValue(event.target.value),
}, props)));
