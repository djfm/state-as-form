/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore, combineReducers } from 'redux';

import {
  Field,
  reducer,
  getFieldValue,
  setFieldValueAction,
} from '../lib';

describe('State as form', () => {
  it('shows an editable field at root level', () => {
    const store = createStore(reducer);

    store.dispatch(setFieldValueAction({
      path: ['hello'],
      value: 'world',
    }));

    const input = mount(
      <Provider store={store}>
        <Field name="hello" />
      </Provider>
    ).find('input');

    input.prop('value').should.equal('world');

    input.simulate('change', {
      target: {
        value: 'yo',
      },
    });

    getFieldValue('hello')(store.getState())
    .should.equal('yo');
  });

  it('shows a deep editable field', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="a">
          <Field name="b">
            <Field id="c" name="c" />
          </Field>
        </Field>
      </Provider>
    ).find('#c input');

    input.simulate('change', {
      target: {
        value: 'yo',
      },
    });

    getFieldValue('a', 'b', 'c')(store.getState())
    .should.equal('yo');
  });

  specify('the default value of fields is the empty string', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="hello" />
      </Provider>
    ).find('input');

    input.prop('value').should.equal('');
  });

  specify('a default value can be provided to fields', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="hello" defaultValue="world" />
      </Provider>
    ).find('input');

    input.prop('value').should.equal('world');

    input.simulate('change', {
      target: {
        value: 'yo',
      },
    });

    getFieldValue('hello')(store.getState())
    .should.equal('yo');
  });

  specify('the default value may come from the form itself', () => {
    const store = createStore(reducer);

    store.dispatch(setFieldValueAction({
      path: ['title'],
      value: 'Welcome',
    }));

    const input = mount(
      <Provider store={store}>
        <Field name="title-fr" defaultValueName="title" />
      </Provider>
    ).find('input');

    input.prop('value').should.equal('Welcome');

    input.simulate('change', {
      target: {
        value: 'Bienvenue',
      },
    });

    input.prop('value').should.equal('Bienvenue');

    store.getState().should.deep.equal({
      title: 'Welcome',
      'title-fr': 'Bienvenue',
    });
  });

  specify('the final component does not receive superfluous props', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="hello" defaultValueName="bob" defaultValue="alice" />
      </Provider>
    ).find('input');

    input.props().should.not.have.any.keys(
      'defaultValueName',
      'defaultValue'
    );
  });

  specify('by default, an input has type text', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="hello" />
      </Provider>
    ).find('input');

    input.prop('type').should.equal('text');
  });

  specify('an input\'s type can be specified', () => {
    const store = createStore(reducer);

    const input = mount(
      <Provider store={store}>
        <Field name="hello" type="email" />
      </Provider>
    ).find('input');

    input.prop('type').should.equal('email');
  });

  specify('the form reducer may be mounted below root level', () => {
    const store = createStore(combineReducers({
      forms: reducer,
    }));

    store.dispatch(setFieldValueAction({
      path: ['title'],
      value: 'Welcome',
    }));

    const input = mount(
      <Provider store={store}>
        <Field mountPoint="forms" name="title" defaultValueName="title" />
      </Provider>
    ).find('input');

    input.prop('value').should.equal('Welcome');
  });
});
