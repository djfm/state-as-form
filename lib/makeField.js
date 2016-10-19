/* eslint-disable react/no-multi-comp */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';

import { prop } from './accessors';
import { propSetAction } from './actions';
import { shallowEqual } from './shallowEqual';

const addContextToProps = varName => component => {
  const AddContextToProps = (props, context) =>
    React.createElement(
      component,
      Object.assign({}, props, { [varName]: context[varName] })
    );

  AddContextToProps.contextTypes = {
    [varName]: PropTypes.any,
  };

  AddContextToProps.displayName = `AddContextToProps(${varName})`;

  return AddContextToProps;
};

const updateContext = (varName, factoryFn) => component => {
  class UpdateContext extends Component {
    getChildContext() {
      return Object.assign({}, this.context, {
        [varName]: factoryFn(this.props),
      });
    }

    render() {
      return React.createElement(component, this.props);
    }
  }

  UpdateContext.childContextTypes = {
    [varName]: PropTypes.any.isRequired,
  };

  UpdateContext.displayName = `UpdateContext(${varName})`;

  return UpdateContext;
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

  return addContextToProps('store')(WithStoreProps);
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
      this.value = getValue(this.props);

      if (this.unsubscribe) {
        return;
      }

      if (this.props.path.length > 1) {
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
        dispatch,
        subscribe,
        getState,
        defaultValue,
        defaultValueName,
        ...props
      } = this.props;

      noop(getState, defaultValue, defaultValueName);

      this.subscribeToStoreChanges(subscribe);

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
    defaultValueName: PropTypes.string,
    defaultValue: PropTypes.any,
  };

  return FieldWrapper;
};

const addDefaults = component => {
  const chooseComponent = props => {
    if (props.component) {
      return { component: props.component };
    }

    if (props.children) {
      return { component: 'div' };
    }

    return { component: 'input', type: props.type || 'text' };
  };

  const FieldDefaults = props => React.createElement(
    component,
    Object.assign({}, props, chooseComponent(props))
  );

  FieldDefaults.propTypes = {
    value: PropTypes.any,
  };

  return FieldDefaults;
};

export const makeField = compose(
  addContextToProps('path'),
  updateContext('path', ({ path = [], name }) =>
    (name ? path.concat(name) : path)
  ),
  addContextToProps('path'),
  addStoreProps,
  addValueAndSetValue,
  addDefaults
);
