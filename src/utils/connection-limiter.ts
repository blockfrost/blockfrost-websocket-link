import { CONNECTION_LIMITER } from '../constants/config.js';

export class ConnectionLimiter {
  private maxConnections: number;
  private timeWindowMs: number; // time window in milliseconds
  private connectionTimestamps: number[];
  private queuedConnections: string[];

  constructor(maxConnections: number, timeWindowMs: number) {
    this.maxConnections = maxConnections;
    this.timeWindowMs = timeWindowMs;
    this.connectionTimestamps = [];
    this.queuedConnections = [];
  }

  // Checks if a new connection is allowed
  public allowNewConnection(id: string): boolean {
    const now = Date.now();

    this.cleanup(now);
    if (this.connectionTimestamps.length < this.maxConnections) {
      this.connectionTimestamps.push(now);
      return true;
    }
    this.queuedConnections.push(id);
    return false;
  }

  public resolveQueuedConnection(id: string) {
    const now = Date.now();

    const index = this.queuedConnections.indexOf(id);

    if (index > -1) {
      this.queuedConnections = this.queuedConnections.splice(index, 1);
    }

    this.connectionTimestamps.push(now);
  }

  // Calculates the delay time before the next allowed connection
  public getDelayTime(): number {
    const now = Date.now();

    this.cleanup(now);
    const oldestTimestamp = this.connectionTimestamps[0];

    // delay is time necessary to squeeze in the window + len(queued connections)
    const delayMs =
      Math.max(0, this.timeWindowMs - (now - oldestTimestamp)) +
      this.queuedConnections.length * 1000;

    // cap max delay to 30s
    const cappedDelay = Math.min(delayMs, 30_000);

    return cappedDelay;
  }

  // Removes old connection timestamps
  private cleanup(currentTime: number): void {
    this.connectionTimestamps = this.connectionTimestamps.filter(
      timestamp => currentTime - timestamp < this.timeWindowMs,
    );
  }
}

export const connectionLimiter = new ConnectionLimiter(
  CONNECTION_LIMITER.CONNECTIONS,
  CONNECTION_LIMITER.WINDOW_MS,
);
