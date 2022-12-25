declare global {
  namespace NodeJS {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      BLOCKFROST_BACKEND_URL: string;
      BLOCKFROST_NETWORK: 'mainnet' | 'preview' | 'preprod';
      BLOCKFROST_PROJECT_ID: string;
      BLOCKFROST_BLOCK_LISTEN_INTERVAL?: string;
    }
  }
}

export {};
