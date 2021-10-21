declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      BACKEND_URL: 'string';
      NETWORK: 'testnet' | 'mainnet';
      PROJECT_ID: 'string';
    }
  }
}

export {};
