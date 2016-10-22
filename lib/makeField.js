/* eslint-disable react/no-multi-comp */

import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';

import { prop, removePropName } from './accessors';
import { setFieldValueAction } from './actions';
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
  const getValue = ({ store, path, mountPoint }, defaultValue) => {
    const finalPath = mountPoint ? [mountPoint].concat(path) : path;

    const value = getFieldValue(...finalPath)(store.getState());

    if (value !== undefined) {
      return value;
    }

    if (defaultValue !== undefined) {
      return defaultValue;
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

      if (this.context.path.length > 1) {
        return;
      }

      this.unsubscribe = subscribe(() => {
        const value = getValue(this.context, this.props.defaultValue);
        if (!shallowEqual(this.value)(value)) {
          this.forceUpdate();
        }
      });
    }

    render() {
      const {
        defaultValue,
        ...props,
      } = this.props;

      this.value = getValue(this.context, defaultValue);
      this.subscribeToStoreChanges(this.context.store.subscribe);

      return React.createElement(
        component,
        Object.assign({
          value: this.value,
          setValue: value => this.context.store.dispatch(
            setFieldValueAction({
              path: this.context.path,
              value,
            })
          ),
        }, props, {})
      );
    }
  }

  FieldWrapper.propTypes = {
    defaultValue: PropTypes.any,
  };

  FieldWrapper.contextTypes = {
    store: PropTypes.object.isRequired,
    path: PropTypes.array.isRequired,
    mountPoint: PropTypes.string,
  };

  return FieldWrapper;
};

const addDefaultsAndRemoveExtraProps = component => {
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
    Object.assign(
      {},
      removePropName('mountPoint')(props),
      chooseComponent(props)
    )
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
  updateContext('mountPoint', (props, context) =>
    props.mountPoint || context.mountPoint
  ),
  addValueAndSetValue,
  addDefaultsAndRemoveExtraProps
);
