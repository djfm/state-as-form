import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';

import { prop, removePropName } from './accessors';
import { setFieldValueAction } from './actions';
import { shallowEqual } from './shallowEqual';

export const getFieldValue = (...path) => state =>
  prop(...path).get(state);

const firstDefined = (...values) => {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};

export const makeField = component => {
  class FieldWrapper extends Component {
    constructor(...args) {
      super(...args);
      const { store: { subscribe } } = this.context;

      this.value = this.createValue();

      this.unsubscribe = subscribe(() => {
        const value = this.createValue();
        if (!shallowEqual(this.value)(value)) {
          this.value = value;
          this.forceUpdate();
        }
      });
    }

    getChildContext() {
      return {
        value: this.createValue(),
        setValue: this.createSetValue(),
        fullValuePath: (this.context.fullValuePath || []).concat(
          this.getValuePath()
        ),
      };
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    getPath() {
      return [].concat(
        firstDefined(
          this.props.name,
          []
        )
      );
    }

    getValuePath() {
      return this.props.mountPoint ?
        [this.props.mountPoint, ...this.getPath()] :
        this.getPath()
      ;
    }

    createValue() {
      const { store, value, fullValuePath = [] } = this.context;

      return firstDefined(
        getFieldValue(...this.getValuePath())(
          fullValuePath.length === 0 ? store.getState() : value
        ),
        this.props.defaultValue,
        ''
      );
    }

    createSetValue() {
      const { store } = this.context;
      const path = this.getPath();

      const setValue = newValue => (
        this.context.setValue ?
          this.context.setValue(
            prop(...path).set(newValue)(this.context.value)
          ) :
          store.dispatch(setFieldValueAction({ path, value: newValue }))
      );

      return compose(
        setValue,
        value => this.props.onChange(value, setValue)
      );
    }

    render() {
      const value = this.createValue();

      return React.createElement(component, Object.assign(
        {},
        removePropName(
          'defaultValue',
          'mountPoint',
          'mapState'
        )(this.props),
        {
          value,
          setValue: this.createSetValue(),
        },
        this.props.onSubmit && {
          onSubmit: event => {
            event.preventDefault();
            this.props.onSubmit(value);
          },
        },
        this.props.mapState && this.props.mapState(value)
      ));
    }
  }

  FieldWrapper.propTypes = {
    name: PropTypes.any,
    defaultValue: PropTypes.any,
    mountPoint: PropTypes.string,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    mapState: PropTypes.func,
  };

  FieldWrapper.defaultProps = {
    onChange: x => x,
  };

  FieldWrapper.contextTypes = {
    store: PropTypes.object,
    value: PropTypes.any,
    setValue: PropTypes.func,
    fullValuePath: PropTypes.array,
  };

  FieldWrapper.childContextTypes = {
    value: PropTypes.any,
    setValue: PropTypes.func.isRequired,
    fullValuePath: PropTypes.array.isRequired,
  };

  return FieldWrapper;
};
