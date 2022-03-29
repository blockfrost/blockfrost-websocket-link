import sinon from 'sinon';
import { blockfrostAPI } from '../../../../src/utils/blockfrost-api';
import { emitBlock, events, onBlock, _resetPreviousBlock } from '../../../../src/events';
import { Subscription, Ws } from '../../../../src/types/server';
import * as txUtils from '../../../../src/utils/transaction';

import * as fixtures from '../../fixtures/events';
import {
  TransformedTransaction,
  TransformedTransactionUtxo,
} from '../../../../src/types/transactions';

describe('events', () => {
  fixtures.emitBlock.forEach(fixture => {
    test(fixture.description, async () => {
      // @ts-ignore
      const mock1 = sinon.stub(blockfrostAPI, 'blocksLatest').resolves(fixture.blocks[0]);
      const callback = jest.fn();

      events.on('newBlock', callback);
      await emitBlock();
      mock1.restore();
      events.removeAllListeners();
      _resetPreviousBlock();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(fixture.blocks[0]);
    });
  });

  fixtures.emitMissedBlock.forEach(fixture => {
    test(fixture.description, async () => {
      const mock1 = sinon.stub(blockfrostAPI, 'blocks');
      mock1
        .onCall(0)
        // @ts-ignore
        .resolves(fixture.missedBlocks[0]);
      mock1
        .onCall(1)
        // @ts-ignore
        .resolves(fixture.missedBlocks[1]);
      const mock2 = sinon.stub(blockfrostAPI, 'blocksLatest');
      mock2
        .onCall(0)
        // @ts-ignore
        .resolves(fixture.latestBlocks[0]);
      mock2
        .onCall(1)
        // @ts-ignore
        .resolves(fixture.latestBlocks[1]);
      const callback = jest.fn();
      events.on('newBlock', callback);

      await emitBlock();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toHaveBeenNthCalledWith(1, fixture.latestBlocks[0]);

      await emitBlock({ maxMissedBlocks: 10 });
      expect(callback).toBeCalledTimes(4); // one time from the first emit, 3 times from 2nd emit (2 missed blocks + latest)
      expect(callback).toHaveBeenNthCalledWith(2, fixture.missedBlocks[0]);
      expect(callback).toHaveBeenNthCalledWith(3, fixture.missedBlocks[1]);
      expect(callback).toHaveBeenNthCalledWith(4, fixture.latestBlocks[1]);
      mock1.restore();
      mock2.restore();
      events.removeAllListeners();
      _resetPreviousBlock();
    });

    test(`${fixture.description} - timeout test`, async () => {
      const blockLatestMock = sinon.stub(blockfrostAPI, 'blocksLatest');
      blockLatestMock
        .onCall(0)
        // @ts-ignore
        .resolves(fixture.latestBlocks[0]);
      blockLatestMock
        .onCall(1)
        // @ts-ignore
        .resolves(fixture.latestBlocks[1]);
      const callback = jest.fn();
      events.on('newBlock', callback);

      const blockMock = sinon.stub(blockfrostAPI, 'blocks');
      blockMock
        .onCall(0)
        // @ts-ignore
        .resolves(fixture.missedBlocks[0]);
      blockMock.onCall(1).returns(
        new Promise(resolve => {
          setTimeout(() => {
            // @ts-ignore
            resolve(fixture.missedBlocks[1]);
          }, 4000);
        }),
      ); // delay 2nd response by 5s, which should trigger timeout

      await emitBlock();
      expect(callback).toBeCalledTimes(1);
      expect(callback).toHaveBeenNthCalledWith(1, fixture.latestBlocks[0]);

      await emitBlock({ fetchTimeoutMs: 3000, maxMissedBlocks: 10 });

      // Following warning is kinda legit:
      // "A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown."
      // We are simulating network timeout by returning a value too late (after 5s)
      // but we will received it in the end. What's important is that such a block wont be emitted.
      // TODO: it would be super cool to abort the promise so we can stop fetching

      // with additional wait we can be sure that the failed block wont be emitted later
      await new Promise(resolve => {
        setTimeout(() => {
          resolve(true);
        }, 1500);
      });

      expect(callback).toBeCalledTimes(3); // one time from the first emit, 2 times from 2nd emit (just 1 missed block (because 2nd block will timeout) + latest block)
      expect(callback).toHaveBeenNthCalledWith(2, fixture.missedBlocks[0]);
      expect(callback).toHaveBeenNthCalledWith(3, fixture.latestBlocks[1]);
      blockLatestMock.restore();
      blockMock.restore();
      events.removeAllListeners();
      _resetPreviousBlock();
    });
  });

  fixtures.onBlock.forEach(fixture => {
    test(`onBlock: ${fixture.description}`, async () => {
      const mockedSend = jest.fn((payload: string) => {
        // console.log('payload', JSON.parse(payload));
        return payload;
      });

      const wsClientMock = {
        send: (msg: string) => mockedSend(msg),
      };

      jest.spyOn(txUtils, 'getTransactionsWithUtxo').mockImplementation((txids: string[]) => {
        return new Promise(resolve => {
          // sanity check that the test really wanted to fetch transactions that we expected
          for (const mockedTx of fixture.mocks.txsWithUtxo) {
            if (!txids.find(txid => mockedTx.txData.hash === txid)) {
              throw Error('Unexpected list of affected addresses');
            }
          }
          resolve(
            fixture.mocks.txsWithUtxo as unknown as {
              txData: TransformedTransaction;
              txUtxos: TransformedTransactionUtxo;
            }[],
          );
        });
      });

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

      jest.resetAllMocks();
      jest.restoreAllMocks();
    });
  });
});
