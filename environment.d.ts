declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      BLOCKFROST_BACKEND_URL: string;
      BLOCKFROST_NETWORK: 'testnet' | 'mainnet';
      BLOCKFROST_PROJECT_ID: string;
      BLOCKFROST_BLOCK_LISTEN_INTERVAL?: string;
    }
  }
}

export {};
