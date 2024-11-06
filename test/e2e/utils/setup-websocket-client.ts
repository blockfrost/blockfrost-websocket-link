import { WebsocketClientE2e } from './websocket-client-e2e.js';

let ws: WebsocketClientE2e;

export const getWebSocketClient = () => ws;

export const setupWebSocketClient = async () => {
  ws = new WebsocketClientE2e('ws://localhost:3005');
  await ws.waitForConnection();
};

export const teardownWebSocketClient = () => {
  if (ws) {
    ws.close();
  }
};
