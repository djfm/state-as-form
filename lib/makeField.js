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
  const getValue = ({ path, getState }) =>
    getFieldValue(...path)(getState());

  class Form extends Component {
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

      this.subscribeToStoreChanges(subscribe);
      this.value = getValue({ path, getState });

      return React.createElement(
        component,
        Object.assign({
          value: this.value,
          setValue: value => dispatch(propSetAction({ path, value })),
        }, props, {})
      );
    }
  }

  Form.propTypes = {
    path: PropTypes.array.isRequired,
    getState: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    subscribe: PropTypes.func.isRequired,
  };

  return Form;
};

export const makeField = compose(
  getContext('path'),
  setContext('path', ({ path = [], name }) =>
    (name ? path.concat(name) : path)
  ),
  getContext('path'),
  addStoreProps,
  addValueAndSetValue
);
