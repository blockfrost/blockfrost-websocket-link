import WebSocket from 'ws';
import { Deferred } from './utils';
import { MESSAGES } from '../../src/constants';

export class TestClient {
  client: WebSocket;
  pingTimeout: NodeJS.Timeout | undefined;
  responseWaitList: { id: number; dfd: Deferred }[] = [];
  debug = false;
  private msgId = 0;
  private _connected = false;

  constructor(url: string, debug = false) {
    this.client = new WebSocket(url);
    this.debug = debug;

    this.client.on('close', () => {
      if (this.debug) {
        console.log('disconnected');
      }
      if (this.pingTimeout) {
        clearTimeout(this.pingTimeout);
      }
    });

    this.client.on('message', (data: any) => {
      this.onMessage(data);
    });
    this.client.on('ping', this.heartbeat);
  }

  async waitForConnection() {
    return new Promise(resolve => {
      this.client.on('open', () => {
        this._connected = true;
        resolve(true);
        if (this.debug) {
          console.log('connected');
        }
      });
    });
  }

  heartbeat() {
    if (this.pingTimeout) {
      clearTimeout(this.pingTimeout);
    }
    this.pingTimeout = setTimeout(() => {
      this.client?.terminate();
    }, 30000 + 1000);
  }

  public get connected() {
    return this._connected;
  }

  onMessage = (data: any) => {
    const msg = JSON.parse(data);
    if (this.debug) {
      console.log('received:', msg);
    }

    const index = this.responseWaitList.findIndex(a => a.id === msg?.id);
    if (index > -1) {
      this.responseWaitList[index].dfd.resolve(true);
      this.responseWaitList.splice(index, 1);
    }
  };

  send = (command: keyof typeof MESSAGES, params?: Record<string, any>) => {
    const id = this.msgId;
    const stringifiedMessage = JSON.stringify({
      id: id,
      command: command,
      params: params ?? {},
    });
    if (this.debug) {
      console.log('send:', id, command, stringifiedMessage);
    }
    this.client.send(stringifiedMessage);
    this.msgId += 1;
  };

  sendAndWait = async (command: keyof typeof MESSAGES, params?: Record<string, any>) => {
    const id = this.msgId;
    const dfd = new Deferred();

    this.responseWaitList.push({ id: id, dfd: dfd });

    this.send(command, params);
    await dfd.promise;
  };
}
