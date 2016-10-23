export const SET_FIELD_VALUE = '@@state-as-form/SET_FIELD_VALUE';
export const UPDATE_FIELD_VALUE = '@@state-as-form/UPDATE_FIELD_VALUE';

export const setFieldValueAction = ({ path, value }) => ({
  type: SET_FIELD_VALUE, path, value,
});

export const updateFieldValueAction = ({ path, update }) => ({
  type: UPDATE_FIELD_VALUE, path, update,
});
