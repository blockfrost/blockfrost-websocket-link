import { WebSocketServer } from 'ws';
import { pLimiter, ratesLimiter } from './limiter';

export const jsonToPrometheus = (metrics: Record<string, unknown>): string => {
  let output = '';
  Object.entries(metrics).forEach(([key, value]) => {
    output += `${key} ${value}\n`;
  });
  return output;
};

export class MetricsCollector {
  metrics = {};
  intervalId: NodeJS.Timer | undefined;
  wss: WebSocketServer;

  constructor(wss: WebSocketServer, interval: number) {
    this.wss = wss;
    this.startCollector(interval);
  }

  private _collect = () => {
    return {
      websocket_link_clients: this.wss.clients.size,
      // https://nodejs.org/api/process.html#processmemoryusage
      websocket_link_rss: process.memoryUsage().rss,
      websocket_link_heap_total: process.memoryUsage().heapTotal,
      websocket_link_heap_used: process.memoryUsage().heapUsed,
      websocket_link_external: process.memoryUsage().external,
      websocket_link_array_buffers: process.memoryUsage().arrayBuffers,
      websocket_link_request_queue_size: pLimiter.size,
      websocket_link_request_queue_pending: pLimiter.pending,
      websocket_link_request_queue_paused: pLimiter.isPaused,
      websocket_link_rates_queue_size: ratesLimiter.size,
      websocket_link_rates_queue_pending: ratesLimiter.pending,
      websocket_link_rates_queue_paused: ratesLimiter.isPaused,
    };
  };

  startCollector = (interval: number) => {
    this.metrics = this._collect();
    this.intervalId = setInterval(() => {
      this.metrics = this._collect();
    }, interval);
  };

  stopCollector = () => {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
  };

  toJson = (): string => {
    return jsonToPrometheus(this.metrics);
  };
}
