import React from 'react';

import { makeField } from './makeField';

const getDefaultComponentProps = ({
  component,
  children,
  type = 'text',
}) => {
  if (component) {
    return { component };
  }

  if (children) {
    return { component: 'div' };
  }

  return { component: 'input', type };
};

const FieldBuilder = props => {
  const {
    component,
    setValue,
    ...finalProps
  } = Object.assign({}, props, getDefaultComponentProps(props));

  return React.createElement(
    component,
    Object.assign({}, finalProps, {
      onChange: event => {
        event.stopPropagation();
        setValue(event.target.value);
      },
    })
  );
};

export const Field = makeField(FieldBuilder);
