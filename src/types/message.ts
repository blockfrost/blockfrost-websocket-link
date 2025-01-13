export const Details = ['basic', 'tokens', 'tokenBalances', 'txids', 'txs'] as const;
export type Details = (typeof Details)[number];

export type MessageId = string | number;

export type BaseMessage = { id: MessageId };

export type Messages = BaseMessage &
  (
    | {
        command: 'GET_ACCOUNT_INFO';
        params: {
          descriptor: string;
          details: Details;
          page?: number;
          pageSize?: number;
          cbor?: boolean;
          mempool?: boolean;
        };
      }
    | {
        command: 'GET_ADA_HANDLE';
        params: {
          name: string;
        };
      }
    | {
        command: 'GET_BALANCE_HISTORY';
        params: {
          descriptor: string;
          groupBy: number;
          from?: number;
          to?: number;
        };
      }
    | {
        command: 'GET_ACCOUNT_UTXO';
        params: {
          descriptor: string;
        };
      }
    | {
        command: 'GET_TRANSACTION';
        params: {
          txId: string;
          cbor?: boolean;
        };
      }
    | {
        command: 'GET_PROTOCOL_PARAMETERS';
        params: null;
      }
    | {
        command: 'GET_SERVER_INFO';
        params: null;
      }
    | {
        command: 'GET_BLOCK';
        params: {
          hashOrNumber: string | number;
        };
      }
    | {
        command: 'PUSH_TRANSACTION';
        params: {
          txData: string;
        };
      }
    | {
        command: 'SUBSCRIBE_BLOCK';
        params: null;
      }
    | {
        command: 'SUBSCRIBE_ADDRESS';
        params: {
          addresses: string[];
          cbor?: boolean;
        };
      }
    | {
        command: 'UNSUBSCRIBE_BLOCK';
        params: null;
      }
    | {
        command: 'ESTIMATE_FEE';
        params: null;
      }
    | {
        command: 'UNSUBSCRIBE_ADDRESS';
        params: null;
      }
    | {
        command: 'ERROR';
        params: null;
      }
  );

export type MessageParams<T extends Messages['command']> = Extract<
  Messages,
  { command: T }
>['params'];
