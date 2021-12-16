export const transformTransaction = [
  {
    description: 'transformTransaction',
    tx: {
      hash: '115293f3a35ca4f4fc01fb0e083f85dde7e77435d53dc15f0a38fa591858bb99',
      block: '31df233d137e13dfc1b5d3722e44f366109830aa2e0b06c36c037ae4d8ab2d54',
      block_height: 3006224,
      block_time: 1634717057,
      slot: 40347841,
      index: 0,
      output_amount: [
        {
          unit: 'lovelace',
          quantity: '9277036205016',
        },
        {
          unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
          quantity: '2',
        },
      ],
      fees: '169021',
      deposit: '0',
      size: 297,
      invalid_before: null,
      invalid_hereafter: '40354932',
      utxo_count: 3,
      withdrawal_count: 0,
      mir_cert_count: 0,
      delegation_count: 0,
      stake_cert_count: 0,
      pool_update_count: 0,
      pool_retire_count: 0,
      asset_mint_or_burn_count: 0,
      redeemer_count: 0,
      valid_contract: true,
    },
    result: {
      hash: '115293f3a35ca4f4fc01fb0e083f85dde7e77435d53dc15f0a38fa591858bb99',
      block: '31df233d137e13dfc1b5d3722e44f366109830aa2e0b06c36c037ae4d8ab2d54',
      block_height: 3006224,
      block_time: 1634717057,
      slot: 40347841,
      index: 0,
      output_amount: [
        {
          unit: 'lovelace',
          quantity: '9277036205016',
          decimals: 6,
        },
        {
          unit: '00000002df633853f6a47465c9496721d2d5b1291b8398016c0e87ae6e7574636f696e',
          quantity: '2',
          fingerprint: 'asset12h3p5l3nd5y26lr22am7y7ga3vxghkhf57zkhd',
          decimals: 0,
        },
      ],
      fees: '169021',
      deposit: '0',
      size: 297,
      invalid_before: null,
      invalid_hereafter: '40354932',
      utxo_count: 3,
      withdrawal_count: 0,
      mir_cert_count: 0,
      delegation_count: 0,
      stake_cert_count: 0,
      pool_update_count: 0,
      pool_retire_count: 0,
      asset_mint_or_burn_count: 0,
      redeemer_count: 0,
      valid_contract: true,
    },
  },
];

export const transformTransactionUtxo = [
  {
    description: 'transformTransactionUtxo',
    utxo: {
      hash: 'ac760bb63e76249a3948fd240d693a358b0c10fb39c04de3007638e1afa01f21',
      inputs: [
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
              quantity: '17179831767',
            },
          ],
          tx_hash: '48b004622f51284e4c4e048ea3acb1001043d1c7467886a31dc53321f7324f90',
          output_index: 0,
          collateral: false,
          data_hash: 'e7b345c671e56c590c96894948725bb6f510790cf21547ee98b365f7c4e6c044',
        },
        {
          address:
            'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
            },
            {
              unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020970a',
              quantity: '1',
            },
          ],
          tx_hash: 'c14446fc2966e1ed3239a184beafbca7708950784d0ec0c8b3af7e17b8881054',
          output_index: 3,
          collateral: false,
          data_hash: null,
        },
      ],
      outputs: [
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
              quantity: '19559831766',
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522524245525259',
              quantity: '6756387014',
            },
            {
              unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70204d01',
              quantity: '1',
            },
          ],
          output_index: 0,
          data_hash: 'dc3ef2a0954c0245b77dd3c448f441d4d91d304383d859851be070444cfa7b99',
        },
      ],
    },
    result: {
      hash: 'ac760bb63e76249a3948fd240d693a358b0c10fb39c04de3007638e1afa01f21',
      inputs: [
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
              decimals: 6,
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
              quantity: '17179831767',
              fingerprint: 'asset15gvggz5s3ptfadt3x6d8p7n5x3petfhrqeps6n',
              decimals: 0,
            },
          ],
          tx_hash: '48b004622f51284e4c4e048ea3acb1001043d1c7467886a31dc53321f7324f90',
          output_index: 0,
          collateral: false,
          data_hash: 'e7b345c671e56c590c96894948725bb6f510790cf21547ee98b365f7c4e6c044',
        },
        {
          address:
            'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
              decimals: 6,
            },
            {
              unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020970a',
              quantity: '1',
              fingerprint: 'asset15dyeej5tee286vcwxmhax920s0djr6gn3qt3ny',

              decimals: 0,
            },
          ],
          tx_hash: 'c14446fc2966e1ed3239a184beafbca7708950784d0ec0c8b3af7e17b8881054',
          output_index: 3,
          collateral: false,
          data_hash: null,
        },
      ],
      outputs: [
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          amount: [
            {
              unit: 'lovelace',
              quantity: '2000000',
              decimals: 6,
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
              quantity: '19559831766',
              fingerprint: 'asset15gvggz5s3ptfadt3x6d8p7n5x3petfhrqeps6n',
              decimals: 0,
            },
            {
              unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf3916522524245525259',
              quantity: '6756387014',
              fingerprint: 'asset19mgmrp86u726wwewrrzx62uf5uje26cyw43mm5',
              decimals: 0,
            },
            {
              unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70204d01',
              quantity: '1',
              fingerprint: 'asset13cjfg3q8zaah00hx0w3mh3ktssjhexgfghw5gn',
              decimals: 0,
            },
          ],
          output_index: 0,
          data_hash: 'dc3ef2a0954c0245b77dd3c448f441d4d91d304383d859851be070444cfa7b99',
        },
      ],
    },
  },
];

export const sortTransactionsCmp = [
  {
    description: 'txs sorting by block height and tx index',
    tx1: {
      block_height: 1,
      index: 0,
    },
    tx2: {
      block_height: 2,
      index: 0,
    },
    result: 1,
  },
  {
    description: 'txs sorting by block height and tx index',
    tx1: {
      block_height: 1,
      index: 2,
    },
    tx2: {
      block_height: 2,
      index: 0,
    },
    result: 1,
  },
  {
    description: 'txs sorting by block height and tx index',
    tx1: {
      block_height: 2,
      index: 1,
    },
    tx2: {
      block_height: 2,
      index: 0,
    },
    result: -1,
  },
  {
    description: 'txs sorting by block height and tx index',
    tx1: {
      block_height: 1,
      index: 1,
    },
    tx2: {
      block_height: 1,
      index: 1,
    },
    result: 0,
  },
];
