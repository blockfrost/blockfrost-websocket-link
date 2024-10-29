import { WebsocketClient } from '../../../src/utils/websocket-client.ts';

export class WebsocketClientE2e extends WebsocketClient {
  private subscriptionMessages: any[] = [];
  private subscriptionCallback?: (message: any) => void;

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
      if (this.subscriptionCallback) {
        this.subscriptionCallback(message);
      }
    }
  };

  setSubscriptionCallback(callback: (message: any) => void) {
    this.subscriptionCallback = callback;
  }

  clearSubscriptionCallback() {
    this.subscriptionCallback = undefined;
  }

  getAllSubscriptionMessages(): any[] {
    return this.subscriptionMessages;
  }

  clearSubscriptionMessages() {
    this.subscriptionMessages = [];
  }
}
