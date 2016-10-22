export const SET_FIELD_VALUE = '@@state-as-form/SET_FIELD_VALUE';

export const setFieldValueAction = ({ path, value }) => ({
  type: SET_FIELD_VALUE, path, value,
});
