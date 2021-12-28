export const getKey = (prefix: 'account' | 'tx', key: string) => {
  return `${prefix}-${key}`;
};
