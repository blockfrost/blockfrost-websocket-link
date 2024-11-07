import { WebsocketClient } from '../../../src/utils/websocket-client.js';

export class WebsocketClientE2e extends WebsocketClient {
  private subscriptionMessages: any[] = [];
  private messagePromiseResolve?: () => void;
  private messageCountTarget: number = 0;

  constructor(url: string, debug = false) {
    super(url, debug);
  }

  onMessage = (data: string) => {
    const message = JSON.parse(data);

    if (this.debug) console.log('received:', data.toString());

    const index = this.responseWaitList.findIndex(a => a.id === message?.id);

    if (index > -1) {
      this.responseWaitList[index].dfd.resolve(message);
      this.responseWaitList.splice(index, 1);
    } else {
      this.subscriptionMessages.push(message);

      if (this.messagePromiseResolve && this.subscriptionMessages.length >= this.messageCountTarget) {
        this.messagePromiseResolve();
        this.messagePromiseResolve = undefined;
      }
    }
  };

  clearSubscriptionMessages() {
    this.subscriptionMessages = [];
  }

  getSubscriptionMessages() {
    return this.subscriptionMessages;
  }

  waitForSubscriptionMessages(count: number,timeout: number = 5000): Promise<any[]> {
    this.messageCountTarget = count;

    if (this.subscriptionMessages.length >= count) {
      return Promise.resolve(this.subscriptionMessages);
    }

    const messagePromise = new Promise<any[]>((resolve) => {
      this.messagePromiseResolve = () => {
        resolve(this.subscriptionMessages);
      };
    });

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeout} ms waiting for ${count} messages`)), timeout);
    });

    return Promise.race([messagePromise, timeoutPromise]);
  }
}
