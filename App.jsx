import React, { PropTypes } from 'react';
import { makeField, Field } from './lib';

const TodoListItemForm = () =>
  <p><Field name="task" /></p>;

const TodoListItem = makeField(TodoListItemForm);

const AddTodoListItemForm = ({ value = [], setValue }) =>
  <p>
    <button
      onClick={() => setValue(value.concat({ id: value.length + 1 }))}
    >
      Add Todo
    </button>
  </p>;

AddTodoListItemForm.propTypes = {
  value: PropTypes.array,
  setValue: PropTypes.func.isRequired,
};

const AddTodoListItem = makeField(AddTodoListItemForm);

const TodoListForm = ({ value: todos }) =>
  <div>
    {todos.map(
      ({ id }) =>
        <TodoListItem key={id} name={todo => todo.id === id} />
    )}
    <AddTodoListItem />
  </div>;

TodoListForm.propTypes = {
  value: PropTypes.array,
};

const TodoList = makeField(TodoListForm);

const App = () =>
  <TodoList name="todoList" />;

export default App;
