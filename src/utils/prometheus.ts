import { WebSocketServer } from 'ws';
import { healthCheck } from './health.js';
import { pLimiter, ratesLimiter } from './limiter.js';
import { logger } from './logger.js';
import { getPort } from './server.js';
import { HEALTHCHECK_FAIL_THRESHOLD_MS } from '../constants/config.js';

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
  intervalId: NodeJS.Timeout | undefined;
  wss: WebSocketServer;
  healthy = true;
  healthCheckFailingSince: number | null = null;

  constructor(wss: WebSocketServer, interval: number) {
    this.wss = wss;
    this.startCollector(interval);
  }

  private _collect = async () => {
    logger.info('[HealthCheck] Running health check');
    const t0 = Date.now();

    try {
      await healthCheck(`ws://localhost:${port}`);
      this.healthy = true;
      this.healthCheckFailingSince = null;
    } catch (error) {
      logger.error(error);
      this.healthy = false;
      if (this.healthCheckFailingSince) {
        const failDurationMs = Date.now() - this.healthCheckFailingSince;

        if (HEALTHCHECK_FAIL_THRESHOLD_MS > 0 && failDurationMs > HEALTHCHECK_FAIL_THRESHOLD_MS) {
          logger.error(
            `Healthcheck failing for longer than ${HEALTHCHECK_FAIL_THRESHOLD_MS} ms. Exiting process.`,
          );
          // eslint-disable-next-line unicorn/no-process-exit
          process.exit(1);
        }
      } else {
        this.healthCheckFailingSince = Date.now();
      }
    }
    const t1 = Date.now();

    const durationSeconds = Math.floor(((t1 - t0) / 1000) * 100) / 100; // 2 decimals

    logger.info(`[HealthCheck] Health check done in ${durationSeconds} seconds.`);
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
    };
  };

  startCollector = async (interval: number) => {
    if (interval > 0) {
      this.metrics = await this._collect();
      this.intervalId = setInterval(async () => {
        this.metrics = await this._collect();
      }, interval);
    }
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
