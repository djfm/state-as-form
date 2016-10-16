import React, { PropTypes } from 'react';

import { makeField } from './makeField';

const FieldBuilder = ({
  component,
  setValue,
  ...props
}) => React.createElement(
  component,
  Object.assign({}, props, {
    onChange: event => setValue(event.target.value),
  })
);

FieldBuilder.propTypes = {
  component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]).isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
};

FieldBuilder.defaultProps = {
  component: 'input',
  value: '',
};

export const Field = makeField(FieldBuilder);
