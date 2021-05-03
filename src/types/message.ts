export type Details = 'basic' | 'tokens' | 'tokenBalances' | 'txids' | 'txs';

export type Messages =
  | {
      id: number;
      command: 'GET_ACCOUNT_INFO';
      params: {
        descriptor: string;
        details: Details;
        page?: number;
        pageSize?: number;
      };
    }
  | {
      id: number;
      command: 'GET_ACCOUNT_UTXO';
      params: {
        descriptor: string;
      };
    }
  | {
      id: number;
      command: 'GET_TRANSACTION';
      params: {
        txId: string;
      };
    }
  | {
      id: number;
      command: 'GET_SERVER_INFO';
      params: null;
    }
  | {
      id: number;
      command: 'GET_BLOCK';
      params: {
        hashOrNumber: string | number;
      };
    }
  | {
      id: number;
      command: 'SEND_TRANSACTION';
      params: {
        txData: Uint8Array;
      };
    }
  | {
      id: number;
      command: 'SUBSCRIBE_BLOCK';
      params: null;
    }
  | {
      id: number;
      command: 'SUBSCRIBE_ADDRESS';
      params: null;
    }
  | {
      id: number;
      command: 'SUBSCRIBE_ACCOUNT';
      params: null;
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_BLOCK';
      params: null;
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_ADDRESS';
      params: null;
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_ACCOUNT';
      params: null;
    }
  | {
      id: number;
      command: 'ERROR';
      params: null;
    };
