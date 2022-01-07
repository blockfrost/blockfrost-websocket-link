// BIP44 gap limit https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
export const ADDRESS_GAP_LIMIT = 20;
// Skip emitting of `newBlock` event for missed blocks if we missed more than defined number of them
export const EMIT_MAX_MISSED_BLOCKS = 3;
// List of coingecko-compatible proxies to retrieve historical fiat rates for balance history endpoint
export const COINGECKO_PROXY = ['https://api.coingecko.com'];
