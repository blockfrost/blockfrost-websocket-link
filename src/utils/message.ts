import { BlockfrostClientError, BlockfrostServerError } from '@blockfrost/blockfrost-js';
import { serializeError } from 'serialize-error';
import { Details, MessageId, Messages } from '../types/message.js';
import { Responses } from '../types/response.js';
import { logger } from './logger.js';
import { Ajv } from 'ajv';

export class MessageError extends Error {}

type Validators =
  | 'root'
  | Extract<Messages, { params: NonNullable<Messages['params']> }>['command'];

const ajv = new Ajv({ allowUnionTypes: true });
const schemas: { [k in Validators]: { properties: unknown; required?: string[] } } = {
  GET_ACCOUNT_INFO: {
    properties: {
      descriptor: { type: 'string' },
      details: { type: 'string', enum: Details },
      page: { type: ['number', 'string', 'null'] },
      pageSize: { type: ['number', 'string', 'null'] },
      cbor: { type: 'boolean' },
    },
    required: ['descriptor', 'details'],
  },
  GET_ACCOUNT_UTXO: {
    properties: {
      descriptor: { type: 'string' },
    },
    required: ['descriptor'],
  },
  GET_ADA_HANDLE: {
    properties: {
      name: { type: 'string' },
    },
    required: ['name'],
  },
  GET_BALANCE_HISTORY: {
    properties: {
      descriptor: { type: 'string' },
      groupBy: { type: ['number', 'string'] },
      from: { type: ['number', 'string', 'null'] },
      to: { type: ['number', 'string', 'null'] },
    },
    required: ['descriptor', 'groupBy'],
  },
  GET_BLOCK: {
    properties: {
      hashOrNumber: { type: ['string', 'number'] },
    },
    required: ['hashOrNumber'],
  },
  GET_TRANSACTION: {
    properties: {
      txId: { type: 'string' },
      cbor: { type: 'boolean' },
    },
    required: ['txId'],
  },
  PUSH_TRANSACTION: {
    properties: {
      txData: { type: 'string' },
    },
    required: ['txData'],
  },
  SUBSCRIBE_ADDRESS: {
    properties: {
      addresses: { type: 'array', items: { type: 'string' } },
      cbor: { type: 'boolean' },
    },
    required: ['addresses'],
  },
  root: {
    properties: {
      command: { type: 'string' },
      id: { type: ['string', 'number'] },
    },
    required: ['command', 'id'],
  },
} as const;

export const validators = Object.fromEntries(
  Object.entries(schemas).map(([title, schema]) => {
    const validator = ajv.compile({
      $schema: 'http://json-schema.org/draft-07/schema#',
      title,
      type: 'object',
      ...schema,
    });

    return [
      title,
      (data: unknown) => {
        if (!validator(data)) {
          throw new MessageError(JSON.stringify(validator.errors));
        }
      },
    ];
  }),
) as { [k in Validators]: (data: unknown) => void };

export const getMessage = (message: string) => {
  let parsedMessage: Messages;

  try {
    parsedMessage = JSON.parse(message);
  } catch {
    throw new MessageError('Cannot parse the message as JSON');
  }

  validators.root(parsedMessage);

  return parsedMessage;
};

export const prepareErrorMessage = (id: MessageId, clientId: string, error: unknown): string => {
  logger.debug(`[${clientId}] Prepared error response for id ${id}.`, error);

  if (
    error instanceof BlockfrostClientError ||
    error instanceof BlockfrostServerError ||
    error instanceof Error ||
    (typeof error === 'object' && error !== null && 'message' in error)
  ) {
    const serializedError = serializeError(error);

    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: {
          ...serializedError,
          stack: undefined,
        },
      },
    });
  } else {
    // string and other non-Error messages
    return JSON.stringify({
      id,
      type: 'error',
      data: {
        error: { message: error },
      },
    });
  }
};

export const prepareMessage = ({ id, clientId, data }: Responses): string => {
  const message = JSON.stringify({ id, type: 'message', data });

  logger.debug(`[${clientId}] Prepared response for msg id ${id} with length ${message.length}`);
  return message;
};
