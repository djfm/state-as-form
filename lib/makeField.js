/* eslint-disable react/no-multi-comp */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';

import { prop } from './accessors';
import { propSetAction } from './actions';
import { shallowEqual } from './shallowEqual';

const getContext = varName => component => {
  const GetContext = (props, context) =>
    React.createElement(
      component,
      Object.assign({}, props, { [varName]: context[varName] })
    );

  GetContext.contextTypes = {
    [varName]: PropTypes.any,
  };

  GetContext.displayName = `GetContext(${varName})`;

  return GetContext;
};

const setContext = (varName, factoryFn) => component => {
  class SetContext extends Component {
    getChildContext() {
      return Object.assign({}, this.context, {
        [varName]: factoryFn(this.props),
      });
    }

    render() {
      return React.createElement(component, this.props);
    }
  }

  SetContext.childContextTypes = {
    [varName]: PropTypes.any.isRequired,
  };

  SetContext.displayName = `SetContext(${varName})`;

  return SetContext;
};

const addStoreProps = component => {
  const WithStoreProps = ({
    store: { getState, dispatch, subscribe },
    ...props
  }) =>
    React.createElement(
      component,
      Object.assign({}, props, { getState, dispatch, subscribe })
    );

  WithStoreProps.propTypes = {
    store: PropTypes.object.isRequired,
  };

  return getContext('store')(WithStoreProps);
};

export const getFieldValue = (...path) => state =>
  prop(...path).get(state);

const addValueAndSetValue = component => {
  const noop = () => null;

  const getValue = ({
    path,
    getState,
    defaultValue,
    defaultValueName,
  }) => {
    const value = getFieldValue(...path)(getState());

    if (value !== undefined) {
      return value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
    }

    if (defaultValueName) {
      const maybeDefaultValue = getFieldValue(
        ...path.slice(0, -1).concat(defaultValueName)
      )(getState());

      if (maybeDefaultValue !== undefined) {
        return maybeDefaultValue;
      }
    }

    return '';
  };

  class FieldWrapper extends Component {
    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
        delete this.unsubscribe;
      }
    }

    subscribeToStoreChanges(subscribe) {
      if (this.unsubscribe) {
        return;
      }

      this.unsubscribe = subscribe(() => {
        const value = getValue(this.props);
        if (!shallowEqual(this.value)(value)) {
          this.forceUpdate();
        }
      });
    }

    render() {
      const {
        path,
        getState,
        dispatch,
        subscribe,
        ...props
      } = this.props;

      noop(getState);

      this.subscribeToStoreChanges(subscribe);
      this.value = getValue(this.props);

      return React.createElement(
        component,
        Object.assign({
          value: this.value,
          setValue: value => dispatch(propSetAction({ path, value })),
        }, props, {})
      );
    }
  }

  FieldWrapper.propTypes = {
    path: PropTypes.array.isRequired,
    getState: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
  };

  return FieldWrapper;
};

const addDefaults = component => {
  const chooseComponent = props => {
    if (props.component) {
      return props.component;
    }

    if (props.children) {
      return 'div';
    }

    return 'input';
  };

  const FieldDefaults = ({
    ...props
  }) => React.createElement(
    component,
    Object.assign({}, props, {
      component: chooseComponent(props),
    })
  );

  FieldDefaults.propTypes = {
    value: PropTypes.any,
  };

  return FieldDefaults;
};

export const makeField = compose(
  getContext('path'),
  setContext('path', ({ path = [], name }) =>
    (name ? path.concat(name) : path)
  ),
  getContext('path'),
  addStoreProps,
  addValueAndSetValue,
  addDefaults
);
