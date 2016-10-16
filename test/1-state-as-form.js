/* eslint-disable react/jsx-filename-extension */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import {
  Field,
  reducer,
  getValue,
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

    getValue('hello')(store.getState())
    .should.equal('yo');
  });
});
