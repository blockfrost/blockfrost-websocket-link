import sinon from 'sinon';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api.js';
import { emitBlock, events, onBlock, _resetPreviousBlock } from '../../../../src/events.js';
import { Subscription, Ws } from '../../../../src/types/server.js';
import * as txUtils from '../../../../src/utils/transaction.js';
import { describe, test, expect, vi } from 'vitest';

import * as fixtures from '../../fixtures/events.js';
import {
  TransformedTransaction,
  TransformedTransactionUtxo,
} from '../../../../src/types/transactions.js';
import { GetTransactionsDetails } from '../../../../src/utils/transaction.js';

describe('events', () => {
  for (const fixture of fixtures.emitBlock) {
    test(fixture.description, async () => {
      // @ts-ignore
      const mock1 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.data[0].block);
      const mockBlockAddresses = sinon
        .stub(blockfrostAPI, 'blocksAddressesAll')
        .resolves(fixture.data[0].blockAddresses ?? []);
      const callback = vi.fn();

      events.on('newBlock', callback);
      await emitBlock();

      mock1.restore();
      mockBlockAddresses.restore();
      events.removeAllListeners();
      _resetPreviousBlock();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(fixture.data[0].block, fixture.data[0].blockAddresses);
    });
  }

  for (const fixture of fixtures.emitMissedBlock) {
    test(fixture.description, async () => {
      const mockBlockAddresses = sinon.stub(blockfrostAPI, 'blocksAddressesAll').resolves([]);
      const mockBlocks = sinon
        .stub(blockfrostAPI, 'blocks')
        // @ts-ignore
        .callsFake(hash => Promise.resolve(fixture.blocks.find(b => b.hash === hash)));
      const mockBlocksLatest = sinon
        .stub(blockfrostAPI, 'blocksLatest')
        .onCall(0)
        // @ts-ignore
        .resolves(fixture.blocks[0])
        .onCall(1)
        // @ts-ignore
        .resolves(fixture.blocks[3]);

      const callback = vi.fn();

      events.on('newBlock', callback);

      await emitBlock();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toHaveBeenNthCalledWith(1, fixture.blocks[0], []);

      await emitBlock({ maxMissedBlocks: 10 });
      expect(callback).toBeCalledTimes(4); // one time from the first emit, 3 times from 2nd emit (2 missed blocks + latest)
      expect(callback).toHaveBeenNthCalledWith(2, fixture.blocks[1], []);
      expect(callback).toHaveBeenNthCalledWith(3, fixture.blocks[2], []);
      expect(callback).toHaveBeenNthCalledWith(4, fixture.blocks[3], []);
      mockBlocks.restore();
      mockBlocksLatest.restore();
      mockBlockAddresses.restore();
      events.removeAllListeners();
      _resetPreviousBlock();
    });
  }

  for (const fixture of fixtures.onBlock) {
    test(`onBlock: ${fixture.description}`, async () => {
      const mockedSend = vi.fn((payload: string) => {
        // console.log('payload', JSON.parse(payload));
        return payload;
      });

      const wsClientMock = {
        send: (message: string) => mockedSend(message),
      };

      vi.spyOn(txUtils, 'getTransactionsWithDetails').mockImplementation(
        (txs: GetTransactionsDetails[]) => {
          return new Promise(resolve => {
            // sanity check that the test really wanted to fetch transactions that we expected
            for (const mockedTx of fixture.mocks.txsWithUtxo) {
              if (!txs.find(({ txId }) => mockedTx.txData.hash === txId)) {
                throw new Error('Unexpected list of affected addresses');
              }
            }
            resolve(
              fixture.mocks.txsWithUtxo as unknown as {
                txData: TransformedTransaction;
                txUtxos: TransformedTransactionUtxo;
              }[],
            );
          });
        },
      );

      // subscribe both to block and addresses
      const subscription = [
        {
          id: 0,
          type: 'addresses',
        },
        {
          id: 1,
          type: 'block',
        },
      ] as Subscription[];

      await onBlock(
        wsClientMock as unknown as Ws,
        '1', // clientId
        fixture.mocks.block,
        fixture.mocks.addressesAffectedInBlock,
        subscription,
        fixture.subscribedAddresses,
      );

      expect(mockedSend).toHaveBeenCalledTimes(fixture.result.length);

      for (const [index, notificationFixture] of fixture.result.entries()) {
        expect(mockedSend).toHaveBeenNthCalledWith(index + 1, JSON.stringify(notificationFixture));
      }

      vi.resetAllMocks();
      vi.restoreAllMocks();
    });
  }
});
