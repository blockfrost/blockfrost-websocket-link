import WebSocket from 'ws';

export interface Ws extends WebSocket {
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
