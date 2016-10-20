export const PROP_SET = '@@state-as-form/SET_FIELD_VALUE';

export const setFieldValueAction = ({ path, value }) => ({
  type: PROP_SET, path, value,
});
