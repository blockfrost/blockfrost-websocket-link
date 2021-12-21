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
      command: 'GET_BALANCE_HISTORY';
      params: {
        descriptor: string;
        groupBy: number;
        from: number;
        to: number;
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
      command: 'PUSH_TRANSACTION';
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
      params: { addresses: string[] };
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_BLOCK';
      params: null;
    }
  | {
      id: number;
      command: 'ESTIMATE_FEE';
      params: null;
    }
  | {
      id: number;
      command: 'UNSUBSCRIBE_ADDRESS';
      params: null;
    }
  | {
      id: number;
      command: 'ERROR';
      params: null;
    };
