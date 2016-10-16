import React from 'react';
import { makeField, Field } from '../..';

const TodoListItem = makeField(
  () => <p><Field name="task" /></p>
);

const AddTodoListItem = makeField(
  ({ value = [], setValue }) =>
    <p>
      <button
        onClick={() => setValue(value.concat({ id: value.length + 1 }))}
      >
        Add Todo
      </button>
    </p>
);

const TodoList = makeField(
  ({ value: todos }) =>
    <div>
      {todos.map(
        ({ id }) =>
          <TodoListItem key={id} name={todo => todo.id === id} />
      )}
      <AddTodoListItem />
    </div>
);

const App = () =>
  <TodoList name="todoList" />;

export default App;
