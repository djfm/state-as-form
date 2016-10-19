/* eslint-disable react/no-multi-comp */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';

import { prop } from './accessors';
import { propSetAction } from './actions';
import { shallowEqual } from './shallowEqual';

const updateContext = (varName, factoryFn) => component => {
  class UpdateContext extends Component {
    getChildContext() {
      return Object.assign({}, this.context, {
        [varName]: factoryFn(this.props, this.context),
      });
    }

    render() {
      return React.createElement(component, this.props);
    }
  }

  UpdateContext.contextTypes =
  UpdateContext.childContextTypes = {
    [varName]: PropTypes.any,
  };

  UpdateContext.displayName = `UpdateContext(${varName})`;

  return UpdateContext;
};

export const getFieldValue = (...path) => state =>
  prop(...path).get(state);

const addValueAndSetValue = component => {
  const noop = () => null;

  class FieldWrapper extends Component {
    componentWillUnmount() {
      if (this.unsubscribe) {
        this.unsubscribe();
        delete this.unsubscribe;
      }
    }

    getValue() {
      const {
        defaultValue,
        defaultValueName,
      } = this.props;

      const { store, path } = this.context;

      const value = getFieldValue(...path)(store.getState());

      if (value !== undefined) {
        return value;
      }

      if (defaultValue !== undefined) {
        return defaultValue;
      }

      if (defaultValueName) {
        const maybeDefaultValue = getFieldValue(
          ...path.slice(0, -1).concat(defaultValueName)
        )(store.getState());

        if (maybeDefaultValue !== undefined) {
          return maybeDefaultValue;
        }
      }

      return '';
    }

    subscribeToStoreChanges(subscribe) {
      this.value = this.getValue();

      if (this.unsubscribe) {
        return;
      }

      if (this.context.path.length > 1) {
        return;
      }

      this.unsubscribe = subscribe(() => {
        const value = this.getValue();
        if (!shallowEqual(this.value)(value)) {
          this.forceUpdate();
        }
      });
    }

    render() {
      const {
        defaultValue,
        defaultValueName,
        ...props
      } = this.props;

      const {
        store: { dispatch, subscribe },
        path,
      } = this.context;

      noop(defaultValue, defaultValueName);

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
    defaultValueName: PropTypes.string,
    defaultValue: PropTypes.any,
  };

  FieldWrapper.contextTypes = {
    store: PropTypes.object.isRequired,
    path: PropTypes.array.isRequired,
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
  updateContext('path', ({ name }, { path = [] }) =>
    (name ? path.concat(name) : path)
  ),
  addValueAndSetValue,
  addDefaults
);
