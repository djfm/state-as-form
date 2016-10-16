import React, { PropTypes } from 'react';
import { makeForm, Field } from './lib';

const TodoListItemForm = () =>
  <p><Field name="task" /></p>;

const TodoListItem = makeForm(TodoListItemForm);

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

const AddTodoListItem = makeForm(AddTodoListItemForm);

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

const TodoList = makeForm(TodoListForm);

const App = () =>
  <TodoList name="todoList" />;

export default App;
