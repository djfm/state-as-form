import React, { PropTypes } from 'react';

import { makeField } from './makeField';

const chooseComponent = (userProvidedComponent, children) => {
  if (userProvidedComponent) {
    return userProvidedComponent;
  }

  if (children) {
    return 'div';
  }

  return 'input';
};

const FieldBuilder = ({
  component,
  setValue,
  ...props
}) => React.createElement(
  chooseComponent(component, props.children),
  Object.assign({}, props, {
    onChange: event => {
      event.stopPropagation();
      setValue(event.target.value);
    },
  })
);

FieldBuilder.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  children: PropTypes.node,
};

export const Field = makeField(FieldBuilder);
