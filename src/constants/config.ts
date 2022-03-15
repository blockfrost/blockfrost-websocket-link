// BIP44 gap limit https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#address-gap-limit
export const ADDRESS_GAP_LIMIT = 20;

// Skip emitting of `newBlock` event for missed blocks if we missed more than defined number of them
export const EMIT_MAX_MISSED_BLOCKS = 3;

// List of coingecko-compatible proxies to retrieve historical fiat rates for getBalanceHistory endpoint
// Set env variable BLOCKFROST_FIAT_RATES_PROXY to provide additional proxies (comma separated values)
// eg. BLOCKFROST_FIAT_RATES_PROXY="https://example.com/api/v3/coins/cardano/history,https://example2.com/history"
export const FIAT_RATES_PROXY = ['https://api.coingecko.com/api/v3/coins/cardano/history'];

// Max number of requests per second sent to FIAT_RATES_PROXY, additional requests will be queued
export const FIAT_RATES_REQUESTS_PER_SEC = 100;

// Request timeout for fetching single rate for a given day
export const FIAT_RATES_REQUESTS_TIMEOUT = 1000;

// Whether to return fiat rates in getBalanceHistory on cardano testnet network
export const FIAT_RATES_ENABLE_ON_TESTNET = false;

// Global requests concurrency limit
export const REQUEST_CONCURRENCY = 500;
