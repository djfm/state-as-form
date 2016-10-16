export const PROP_SET = '@@state-as-form/PROP_SET';

export const propSetAction = ({ path, value }) => ({
  type: PROP_SET, path, value,
});
