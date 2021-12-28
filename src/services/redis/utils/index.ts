export const getKey = (prefix: 'account' | 'tx' | 'address', key: string) => {
  return `${prefix}-${key}`;
};
