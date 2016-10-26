import React, { PropTypes } from 'react';

import { makeField } from './makeField';

const FieldBuilder = ({
  component,
  setValue,
  ...props
}) => React.createElement(
  component,
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
  ]).isRequired,
  setValue: PropTypes.func.isRequired,
};

export const Field = makeField(FieldBuilder);
