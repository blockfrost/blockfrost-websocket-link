// cSpell: disable

export const emitBlock = [
  {
    description: 'one block',
    blocks: [
      {
        time: 1506203091,
        height: 1,
        hash: 'a',
      },
    ],
  },
];

export const emitMissedBlock = [
  {
    description: 'missed 2 blocks',
    latestBlocks: [
      {
        time: 1506203091,
        height: 1,
        hash: 'a',
      },
      {
        time: 1506203091,
        height: 4,
        hash: 'd',
      },
    ],
    missedBlocks: [
      {
        time: 1506203091,
        height: 2,
        hash: 'b',
      },
      {
        time: 1506203091,
        height: 3,
        hash: 'c',
      },
    ],
  },
];

export const onBlock = [
  {
    description: "1 of client's addresses affected in a block (real data)",
    subscribedAddresses: [{address:'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',cbor:true}],
    mocks: {
      block: {
        time: 1639491936,
        height: 3152805,
        hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
        slot: 45122720,
        epoch: 174,
        epoch_slot: 324320,
        slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
        size: 15416,
        tx_count: 2,
        output: '3371541981',
        fees: '1458019',
        block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
        previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
        next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
        confirmations: 14,
        op_cert: null,
        op_cert_counter: null,
      },
      addressesAffectedInBlock: [
        {
          address:
            'addr_test1qpfvzlfra5lfnmnj85fk5zr5p7cf3vlhkqe8tue8632fcllw96vr28q0wdcmwp6djuhpdu5zzns8290jul9mcuu2uv2sw9f9ns',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address:
            'addr_test1qq5axgqasd8g3hjn6zl63tv8n0577ytuymkgq23t7pm4hmj60ur0n6plajqxq0u6tcdc8gw8hzpj3h6kz98fapf8gwzqnnemd5',
          transactions: [
            { tx_hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72' },
          ],
        },
        {
          address:
            'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address:
            'addr_test1qrrr6qhy6qaxwdkdx2g5fneg6suz72uy294pf57qlhkym6rjtttjuq8reajre6rmtyp9hsm3qc8sma8p4rs9ajc7rruspdc5yu',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
            { tx_hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72' },
          ],
        },
      ],
      txsWithUtxo: [
        {
          txData: {
            hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
            block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
            block_height: 3152805,
            block_time: 1639491936,
            slot: 45122720,
            index: 0,
            output_amount: [
              {
                unit: 'lovelace',
                quantity: '1371729086',
              },
              {
                unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                quantity: '1360000000',
              },
              {
                unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                quantity: '1',
              },
              {
                unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                quantity: '10000000',
              },
              {
                unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                quantity: '50000000',
              },
              {
                unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                quantity: '1',
              },
            ],
            fees: '1270914',
            deposit: '0',
            size: 14796,
            invalid_before: '45122712',
            invalid_hereafter: '45126311',
            utxo_count: 9,
            withdrawal_count: 0,
            mir_cert_count: 0,
            delegation_count: 0,
            stake_cert_count: 0,
            pool_update_count: 0,
            pool_retire_count: 0,
            asset_mint_or_burn_count: 1,
            redeemer_count: 4,
            valid_contract: true,
          },
          txUtxos: {
            hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
            inputs: [
              {
                address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '1302000000',
                  },
                  {
                    unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                    quantity: '1300000000',
                  },
                  {
                    unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                    quantity: '1',
                  },
                ],
                tx_hash: '11a3596a8d7ba851481742ed6eb3a85e12b9ac73dc5bb5b6acccbb4646831969',
                output_index: 0,
                collateral: false,
                data_hash: '0862997dc9dd52257bf1cdd12ffaac0bb63c492bf58e688fc395af69dae4f47c',
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
                    unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                    quantity: '1',
                  },
                ],
                tx_hash: '50604b49d5c725ecea0a4907df191c4a0fc9013b41bdeded7bc818eb2a29be21',
                output_index: 3,
                collateral: false,
                data_hash: null,
              },
              {
                address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '14500000',
                  },
                  {
                    unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                    quantity: '10000000',
                  },
                ],
                tx_hash: 'e974d5d36b8f9f22e72567a2a5274918bf64ae214945ac718d4b4ce0a46e64f6',
                output_index: 0,
                collateral: false,
                data_hash: '7b86ec76f3c413f5b6d4dd33f1db68fd36e8d92fbec2a3026ffaeaa505b5c8b5',
              },
              {
                address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '54500000',
                  },
                  {
                    unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                    quantity: '50000000',
                  },
                ],
                tx_hash: 'f8c9f0729daff1884ec3b3257dd8719f4999f0e96571b45eaafb0e11fa8502ca',
                output_index: 0,
                collateral: false,
                data_hash: '2737c48f3051315ecc52e422ef4c688af65b909173c40aa56deb5a836cbaebe0',
              },
              {
                address:
                  'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '142000000',
                  },
                ],
                tx_hash: '05fa9e865a808986cfd1f9eb52d804c1e3a7d85283b5c3e502f3c9ca6aeab682',
                output_index: 5,
                collateral: true,
                data_hash: null,
              },
            ],
            outputs: [
              {
                address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '1362000000',
                  },
                  {
                    unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                    quantity: '1360000000',
                  },
                  {
                    unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                    quantity: '1',
                  },
                ],
                output_index: 0,
                data_hash: '624bbbe04510815b5608ca17bb276ba67233e769012911161379a840cea766c1',
              },
              {
                address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '3729086',
                  },
                ],
                output_index: 1,
                data_hash: '6d3a332dc17174b0f1e04310dd76c4bbf9fa1c5b335c11de1531bb035f207882',
              },
              {
                address:
                  'addr_test1qpfvzlfra5lfnmnj85fk5zr5p7cf3vlhkqe8tue8632fcllw96vr28q0wdcmwp6djuhpdu5zzns8290jul9mcuu2uv2sw9f9ns',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '2000000',
                  },
                  {
                    unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                    quantity: '10000000',
                  },
                ],
                output_index: 2,
                data_hash: null,
              },
              {
                address:
                  'addr_test1qrrr6qhy6qaxwdkdx2g5fneg6suz72uy294pf57qlhkym6rjtttjuq8reajre6rmtyp9hsm3qc8sma8p4rs9ajc7rruspdc5yu',
                amount: [
                  {
                    unit: 'lovelace',
                    quantity: '2000000',
                  },
                  {
                    unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                    quantity: '50000000',
                  },
                ],
                output_index: 3,
                data_hash: null,
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
                    unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                    quantity: '1',
                  },
                ],
                output_index: 4,
                data_hash: null,
              },
            ],
          },
          txCbor: {
            cbor: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
          }
        },
      ],
    },
    result: [
      {
        id: 1,
        type: 'message',
        data: {
          time: 1639491936,
          height: 3152805,
          hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
          slot: 45122720,
          epoch: 174,
          epoch_slot: 324_320,
          slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
          size: 15416,
          tx_count: 2,
          output: '3371541981',
          fees: '1458019',
          block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
          previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
          next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
          confirmations: 14,
          op_cert: null,
          op_cert_counter: null,
        },
      },
      {
        id: 0,
        type: 'message',
        data: [
          {
            address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
            txData: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
              block_height: 3152805,
              block_time: 1639491936,
              slot: 45122720,
              index: 0,
              output_amount: [
                {
                  unit: 'lovelace',
                  quantity: '1371729086',
                },
                {
                  unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                  quantity: '1360000000',
                },
                {
                  unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                  quantity: '1',
                },
                {
                  unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                  quantity: '10000000',
                },
                {
                  unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                  quantity: '50000000',
                },
                {
                  unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                  quantity: '1',
                },
              ],
              fees: '1270914',
              deposit: '0',
              size: 14796,
              invalid_before: '45122712',
              invalid_hereafter: '45126311',
              utxo_count: 9,
              withdrawal_count: 0,
              mir_cert_count: 0,
              delegation_count: 0,
              stake_cert_count: 0,
              pool_update_count: 0,
              pool_retire_count: 0,
              asset_mint_or_burn_count: 1,
              redeemer_count: 4,
              valid_contract: true,
            },
            txUtxos: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              inputs: [
                {
                  address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '1302000000',
                    },
                    {
                      unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                      quantity: '1300000000',
                    },
                    {
                      unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                      quantity: '1',
                    },
                  ],
                  tx_hash: '11a3596a8d7ba851481742ed6eb3a85e12b9ac73dc5bb5b6acccbb4646831969',
                  output_index: 0,
                  collateral: false,
                  data_hash: '0862997dc9dd52257bf1cdd12ffaac0bb63c492bf58e688fc395af69dae4f47c',
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
                      unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                      quantity: '1',
                    },
                  ],
                  tx_hash: '50604b49d5c725ecea0a4907df191c4a0fc9013b41bdeded7bc818eb2a29be21',
                  output_index: 3,
                  collateral: false,
                  data_hash: null,
                },
                {
                  address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '14500000',
                    },
                    {
                      unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                      quantity: '10000000',
                    },
                  ],
                  tx_hash: 'e974d5d36b8f9f22e72567a2a5274918bf64ae214945ac718d4b4ce0a46e64f6',
                  output_index: 0,
                  collateral: false,
                  data_hash: '7b86ec76f3c413f5b6d4dd33f1db68fd36e8d92fbec2a3026ffaeaa505b5c8b5',
                },
                {
                  address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '54500000',
                    },
                    {
                      unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                      quantity: '50000000',
                    },
                  ],
                  tx_hash: 'f8c9f0729daff1884ec3b3257dd8719f4999f0e96571b45eaafb0e11fa8502ca',
                  output_index: 0,
                  collateral: false,
                  data_hash: '2737c48f3051315ecc52e422ef4c688af65b909173c40aa56deb5a836cbaebe0',
                },
                {
                  address:
                    'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '142000000',
                    },
                  ],
                  tx_hash: '05fa9e865a808986cfd1f9eb52d804c1e3a7d85283b5c3e502f3c9ca6aeab682',
                  output_index: 5,
                  collateral: true,
                  data_hash: null,
                },
              ],
              outputs: [
                {
                  address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '1362000000',
                    },
                    {
                      unit: '57fca08abbaddee36da742a839f7d83a7e1d2419f1507fcbf39165224d494e54',
                      quantity: '1360000000',
                    },
                    {
                      unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f70202e01',
                      quantity: '1',
                    },
                  ],
                  output_index: 0,
                  data_hash: '624bbbe04510815b5608ca17bb276ba67233e769012911161379a840cea766c1',
                },
                {
                  address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '3729086',
                    },
                  ],
                  output_index: 1,
                  data_hash: '6d3a332dc17174b0f1e04310dd76c4bbf9fa1c5b335c11de1531bb035f207882',
                },
                {
                  address:
                    'addr_test1qpfvzlfra5lfnmnj85fk5zr5p7cf3vlhkqe8tue8632fcllw96vr28q0wdcmwp6djuhpdu5zzns8290jul9mcuu2uv2sw9f9ns',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '2000000',
                    },
                    {
                      unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                      quantity: '10000000',
                    },
                  ],
                  output_index: 2,
                  data_hash: null,
                },
                {
                  address:
                    'addr_test1qrrr6qhy6qaxwdkdx2g5fneg6suz72uy294pf57qlhkym6rjtttjuq8reajre6rmtyp9hsm3qc8sma8p4rs9ajc7rruspdc5yu',
                  amount: [
                    {
                      unit: 'lovelace',
                      quantity: '2000000',
                    },
                    {
                      unit: 'd311d3488cc4fef19d05634adce8534977a3bc6fc18136ad65df1d4f6c71202e01',
                      quantity: '50000000',
                    },
                  ],
                  output_index: 3,
                  data_hash: null,
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
                      unit: '4fc16c94d066e949e771c5581235f8090ad6aaffaf373a426445ca5173636f6f7020960a',
                      quantity: '1',
                    },
                  ],
                  output_index: 4,
                  data_hash: null,
                },
              ],
            },
            txHash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
            txCbor: {cbor:'0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'}
          },
        ],
      },
    ],
  },
  {
    description: "2 of the client's addresses affected, 1 address affected in multiple txs",
    subscribedAddresses: [
      {address:'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h'},
      {address:'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t'},
      {address:'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g770j9h'}, // random address, should not be affected
    ],
    mocks: {
      block: {
        time: 1639491936,
        height: 3152805,
        hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
        slot: 45122720,
        epoch: 174,
        epoch_slot: 324320,
        slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
        size: 15416,
        tx_count: 2,
        output: '3371541981',
        fees: '1458019',
        block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
        previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
        next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
        confirmations: 14,
        op_cert: null,
        op_cert_counter: null,
      },
      addressesAffectedInBlock: [
        {
          address:
            'addr_test1qpfvzlfra5lfnmnj85fk5zr5p7cf3vlhkqe8tue8632fcllw96vr28q0wdcmwp6djuhpdu5zzns8290jul9mcuu2uv2sw9f9ns',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address:
            'addr_test1qq5axgqasd8g3hjn6zl63tv8n0577ytuymkgq23t7pm4hmj60ur0n6plajqxq0u6tcdc8gw8hzpj3h6kz98fapf8gwzqnnemd5',
          transactions: [
            { tx_hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72' },
          ],
        },
        {
          address:
            'addr_test1qqmfw4wcu6updqj28jeshzsd9f2y34gf7zvqv5usu4pkd2cx8t305xhve0caejq5vm6fxaztzpeyjnp5ch5sxxz93l9qrnq7z9',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address:
            'addr_test1qrrr6qhy6qaxwdkdx2g5fneg6suz72uy294pf57qlhkym6rjtttjuq8reajre6rmtyp9hsm3qc8sma8p4rs9ajc7rruspdc5yu',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address: 'addr_test1wp9m8xkpt2tmy7madqldspgzgug8f2p3pwhz589cq75685slenwf4',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        }, // this one is affected
        {
          address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
            { tx_hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72' },
          ],
        }, // this one is affected
      ],
      txsWithUtxo: [
        {
          txData: {
            hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
            block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
            block_height: 3152805,
            block_time: 1639491936,
          },
          txUtxos: {
            hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
            // truncated as inputs/outputs should not be necessary in this test
            inputs: [],
            outputs: [],
          },
        },
        {
          txData: {
            hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72',
            block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
            block_height: 3152805,
            block_time: 1639491936,
          },
          txUtxos: {
            hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72',
            // truncated as inputs/outputs should not be necessary in this test
            inputs: [],
            outputs: [],
          },
        },
      ],
    },
    result: [
      // 2 notifications, 1. block notif, 2. tx notif
      {
        id: 1,
        type: 'message',
        data: {
          time: 1639491936,
          height: 3152805,
          hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
          slot: 45122720,
          epoch: 174,
          epoch_slot: 324320,
          slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
          size: 15416,
          tx_count: 2,
          output: '3371541981',
          fees: '1458019',
          block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
          previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
          next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
          confirmations: 14,
          op_cert: null,
          op_cert_counter: null,
        },
      },
      {
        id: 0,
        type: 'message',
        data: [
          {
            address: 'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g77pj9h',
            txData: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
              block_height: 3152805,
              block_time: 1639491936,
            },
            txUtxos: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              inputs: [],
              outputs: [],
            },
            txHash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
          },
          {
            address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
            txData: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
              block_height: 3152805,
              block_time: 1639491936,
            },
            txUtxos: {
              hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
              // truncated as inputs/outputs should not be necessary in this test
              inputs: [],
              outputs: [],
            },
            txHash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b',
          },
          {
            address: 'addr_test1wrsexavz37208qda7mwwu4k7hcpg26cz0ce86f5e9kul3hqzlh22t',
            txData: {
              hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72',
              block: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
              block_height: 3152805,
              block_time: 1639491936,
            },
            txUtxos: {
              hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72',
              // truncated as inputs/outputs should not be necessary in this test
              inputs: [],
              outputs: [],
            },
            txHash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72',
          },
        ],
      },
    ],
  },

  {
    description: 'subscribed address was not affected',
    subscribedAddresses: [
      {address:'addr_test1wpfzvzpa046hkfy65mp4ez6vgjunmytzg0ye0ds7mm26v0g770j9h'}, // random address, should not be affected
    ],
    mocks: {
      block: {
        time: 1639491936,
        height: 3152805,
        hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
        slot: 45122720,
        epoch: 174,
        epoch_slot: 324320,
        slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
        size: 15416,
        tx_count: 2,
        output: '3371541981',
        fees: '1458019',
        block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
        previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
        next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
        confirmations: 14,
        op_cert: null,
        op_cert_counter: null,
      },
      addressesAffectedInBlock: [
        {
          address:
            'addr_test1qpfvzlfra5lfnmnj85fk5zr5p7cf3vlhkqe8tue8632fcllw96vr28q0wdcmwp6djuhpdu5zzns8290jul9mcuu2uv2sw9f9ns',
          transactions: [
            { tx_hash: '4d5beb45fe37b44b46f839811a3d3a1ac4a20911850740867a64f77d09372d0b' },
          ],
        },
        {
          address:
            'addr_test1qq5axgqasd8g3hjn6zl63tv8n0577ytuymkgq23t7pm4hmj60ur0n6plajqxq0u6tcdc8gw8hzpj3h6kz98fapf8gwzqnnemd5',
          transactions: [
            { tx_hash: '4f18be04c3587d49ae1ce32ceaf841c58ab7ab459847b4943bbd02309315ec72' },
          ],
        },
      ],
      txsWithUtxo: [],
    },
    result: [
      {
        id: 1,
        type: 'message',
        data: {
          time: 1639491936,
          height: 3152805,
          hash: '9b4f18889ea91b644462ea50d733a372313222d71ecc60d18c2d7f3f5db1f2de',
          slot: 45122720,
          epoch: 174,
          epoch_slot: 324320,
          slot_leader: 'pool1weu4vlg9t8knma7t2j5y3w2k3vzdr9mtnynd2jhfalwn76nwh48',
          size: 15416,
          tx_count: 2,
          output: '3371541981',
          fees: '1458019',
          block_vrf: 'vrf_vk1mzhz5k03lahvx0gdlqtplkyasgzn8w2cpf8y8a8f76nzskptzzhqdqyyq3',
          previous_block: '426440d04d9591508760e4c4602701d960c91536c61e1b769d4c38dd4e4c07db',
          next_block: 'ad8514bee933f0e08cb6f8444fe83b0149217ff95a80b08e1f23574c31f69f9f',
          confirmations: 14,
          op_cert: null,
          op_cert_counter: null,
        },
      },
    ],
  },
];
