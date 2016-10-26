import React from 'react';
import { makeField, Field } from '../../lib';

const TodoListItem = makeField(
  () => <p><Field name="task" /></p>
);

const AddTodoListItem = makeField(
  ({ value: todos = [], setValue }) =>
    <p>
      <button
        onClick={() => setValue(todos.concat({ id: todos.length + 1 }))}
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
