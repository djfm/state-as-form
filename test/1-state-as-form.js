/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import {
  Field,
  reducer,
  getFieldValue,
} from '../lib';

describe('State as form', () => {
  it('shows an editable field at root level', () => {
    const store = createStore(reducer, {
      hello: 'world',
    });

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
});
