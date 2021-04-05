import test from 'ava';

import * as utils from '../../src/utils';

test('prepareMessage', t => {
    const message = utils.prepareMessage('a', 'b');

    t.is(message, '{"message":"a","payload":"b"}');
});

test('getParams', t => {
    const params1 = utils.getParams(JSON.stringify('GET_ACCOUNT_INFO'));

    t.is(params1, {
        command: 'GET_ACCOUNT_INFO',
    });
});
