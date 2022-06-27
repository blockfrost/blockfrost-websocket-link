import { WebSocketServer } from 'ws';
import { healthCheck } from './health';
import { assetMetadataLimiter, pLimiter, ratesLimiter } from './limiter';
import { logger } from './logger';
import { getPort } from './server';

const port = getPort();

export const jsonToPrometheus = (metrics: Record<string, unknown>): string => {
  let output = '';

  for (const [key, value] of Object.entries(metrics)) {
    output += `${key} ${value}\n`;
  }
  return output;
};

export class MetricsCollector {
  metrics = {};
  intervalId: NodeJS.Timer | undefined;
  wss: WebSocketServer;
  healthy = true;

  constructor(wss: WebSocketServer, interval: number) {
    this.wss = wss;
    this.startCollector(interval);
  }

  private _collect = async () => {
    logger.info('[HealthCheck] Running health check');
    try {
      await healthCheck(`ws://localhost:${port}`);
      this.healthy = true;
    } catch (error) {
      logger.error(error);
      this.healthy = false;
    }
    logger.info('[HealthCheck] Health check done');
    return {
      is_healthy: this.healthy ? 1 : 0,
      websocket_link_clients: this.wss.clients.size,
      // https://nodejs.org/api/process.html#processmemoryusage
      websocket_link_rss: process.memoryUsage().rss,
      websocket_link_heap_total: process.memoryUsage().heapTotal,
      websocket_link_heap_used: process.memoryUsage().heapUsed,
      websocket_link_external: process.memoryUsage().external,
      websocket_link_array_buffers: process.memoryUsage().arrayBuffers,
      websocket_link_request_queue_size: pLimiter.size,
      websocket_link_request_queue_pending: pLimiter.pending,
      websocket_link_request_queue_paused: pLimiter.isPaused ? 1 : 0,
      websocket_link_rates_queue_size: ratesLimiter.size,
      websocket_link_rates_queue_pending: ratesLimiter.pending,
      websocket_link_rates_queue_paused: ratesLimiter.isPaused ? 1 : 0,
      websocket_link_asset_metadata_queue_size: assetMetadataLimiter.size,
      websocket_link_asset_metadata_queue_pending: assetMetadataLimiter.pending,
    };
  };

  startCollector = async (interval: number) => {
    this.metrics = await this._collect();
    this.intervalId = setInterval(async () => {
      this.metrics = await this._collect();
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
