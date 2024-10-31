import { describe, test, expect } from 'vitest';
import * as utils from '../../../src/utils/message.js';

const command = "COMMAND";

describe('messages utils', () => {
  test('get params', () => {
    expect(utils.getMessage(JSON.stringify({ command, id: 1, item: 'item value' }))).toEqual({
      command,
      id: 1,
      item: 'item value',
    });

    expect(utils.getMessage(JSON.stringify({ command, id: "1", item: 'item value', item2: 'item2 value' }))).toEqual({
      command,
      id: "1",
      item: 'item value',
      item2: 'item2 value',
    });

    expect(() => utils.getMessage(JSON.stringify({ item: 'item value' }))).toThrow("must have required property 'command'");
    expect(() => utils.getMessage(JSON.stringify({ command: {}, id: 1, item: 'item value' }))).toThrow('must be string');
    expect(() => utils.getMessage(JSON.stringify({ command, item: 'item value' }))).toThrow("must have required property 'id'");
    expect(() => utils.getMessage(JSON.stringify({ command, id: [], item: 'item value' }))).toThrow('must be string,number');
  });
});
