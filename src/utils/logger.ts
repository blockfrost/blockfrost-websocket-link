type Level = 'debug' | 'log' | 'info' | 'warn' | 'error';

const LevelMap = {
  debug: 0,
  log: 1,
  info: 2,
  warn: 3,
  error: 4,
};

type Logger = {
  [k in Level]: (...arguments_: unknown[]) => void;
};

interface LoggerOptions {
  level: Level;
  label?: string;
  printTimestamp?: boolean;
}

const myFormat = ({
  level,
  args,
  label,
  timestamp,
}: {
  level: string;
  args: unknown[];
  label: string | undefined;
  timestamp: string | undefined;
}): unknown[] => {
  return [`${timestamp ? `[${timestamp}] ` : ''}${label ? `[${label}] ` : ''}[${level}]`, ...args];
};

const onMessage = (options: LoggerOptions, ...arguments_: unknown[]) => {
  const formattedMessage = myFormat({
    level: options.level.toUpperCase(),
    args: arguments_,
    timestamp: options.printTimestamp ? new Date().toISOString() : undefined,
    label: options.label ?? undefined,
  });

  console[options.level](...formattedMessage);
};

export const getLogger = (options: LoggerOptions): Logger => {
  const requestedLevel = LevelMap[options.level];

  const getMethod = (methodLevel: Level) => {
    return requestedLevel > LevelMap[methodLevel]
      ? // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {}
      : (...arguments_: unknown[]) => onMessage({ ...options, level: methodLevel }, ...arguments_);
  };

  return {
    debug: getMethod('debug'),
    log: getMethod('info'),
    info: getMethod('info'),
    warn: getMethod('warn'),
    error: getMethod('error'),
  };
};

export const logger = getLogger({
  level: process.env.BLOCKFROST_WSLINK_DEBUG ? 'debug' : 'info',
  printTimestamp: process.env.NODE_ENV === 'development' ? true : false,
});
