import WebSocket from 'ws';

export interface Ws extends WebSocket {
  uid: string;
  isAlive: boolean;
}

export type Subscription =
  | {
      id: number;
      type: 'block';
    }
  | {
      id: number;
      type: 'addresses';
    };
