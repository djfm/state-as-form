import React from 'react';
import { Provider } from 'react-redux';
import { render as renderIntoDOM } from 'react-dom';
import { createStore } from 'redux';

const makeReducer = () => {
  // eslint-disable-next-line global-require
  const { reducer } = require('../..');

  return reducer;
};

const initialState = {
  todoList: [{ id: 1, task: 'Do Something' }],
};

const store = createStore(
  makeReducer(),
  initialState,
  // eslint-disable-next-line no-underscore-dangle
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const render = () => {
  // eslint-disable-next-line global-require
  const App = require('./App').default;

  renderIntoDOM(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('mount')
  );
};

render();

if (module.hot) {
  module.hot.accept('./App', render);
  module.hot.accept('../..', () => store.replaceReducer(makeReducer()));
}
