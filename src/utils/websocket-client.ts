import WebSocket from 'ws';
import { Deferred } from '../scripts/performance/utils.js';
import { MessageParams, Messages } from '../types/message.js';

export class WebsocketClient {
  client: WebSocket;
  pingTimeout: NodeJS.Timeout | undefined;
  responseWaitList: { id: number; dfd: Deferred<unknown> }[] = [];
  protected debug = false;
  protected msgId = 0;
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

    this.client.on('message', (data: string) => {
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
    }, 30_000 + 1000);
  }

  public get connected() {
    return this._connected;
  }

  onMessage = (data: string) => {
    const message = JSON.parse(data);

    if (this.debug) {
      console.log('received:', message);
    }

    const index = this.responseWaitList.findIndex(a => a.id === message?.id);

    if (index > -1) {
      this.responseWaitList[index].dfd.resolve(message.data);
      this.responseWaitList.splice(index, 1);
    }
  };

  send = <T extends Messages['command']>(command: T, parameters?: MessageParams<T>) => {
    const id = this.msgId;
    const stringifiedMessage = JSON.stringify({
      id: id,
      command: command,
      params: parameters ?? {},
    });

    if (this.debug) {
      console.log('send:', id, command, stringifiedMessage);
    }
    this.client.send(stringifiedMessage);
    this.msgId += 1;
  };

  sendAndWait = async <T extends Messages['command']>(
    command: T,
    parameters?: MessageParams<T>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    const id = this.msgId;
    const dfd = new Deferred();

    this.responseWaitList.push({ id: id, dfd: dfd });

    this.send(command, parameters);
    await dfd.promise;
    return dfd.promise;
  };

  close = () => {
    this.client.close();
  };
}
