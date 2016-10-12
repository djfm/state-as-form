import React from 'react';
import { Form, makeField } from './lib';

const TodoListItem = () =>
  <div>
    Hey!!
  </div>
;

const TodoList = makeField(({
  value = [],
  setValue,
}) =>
  <div>
    {value.map(
      (item, index) => <TodoListItem key={index} {...item} />
    )}
    <button
      type="button"
      onClick={() => setValue(value.concat('Something to do'))}
    >
      Add TODO Item
    </button>
  </div>
);

const App = () =>
  <Form name="app">
    <TodoList name="todoList" />
  </Form>;

export default App;
