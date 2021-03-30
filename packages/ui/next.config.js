const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd ? 'https://trezor-cardano-mainnet.blockfrost.io/ui/' : '',
};
