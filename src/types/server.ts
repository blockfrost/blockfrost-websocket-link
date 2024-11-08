import WebSocket from 'ws';
import { BaseMessage } from './message.js';

export interface Ws extends WebSocket {
  uid: string;
  isAlive: boolean;
}

export type Subscription = BaseMessage & ({ type: 'block' } | { type: 'addresses' });
