import * as Types from 'types';

export default (): Types.ServerInfo => {
  return {
    name: 'Cardano',
    shortcut: 'ada',
    testnet: false,
    version: '1',
    decimals: 6,
    blockHash: 1,
    blockHeight: 1,
  };
};
