import { expect } from 'vitest';

export default [
  {
    testName: 'SUBSCRIBE_ADDRESS success - preprod',
    result: {
      'subscribed': true,
    },
    sendingWallet: {
      mnemonic: 'canyon kind action trade soon thing winner awake inform style clap act material panda scare bonus bamboo smile owner cream myself country blood force',
      publicKey: '29c56f19b232c2cfc65bfc562f5f489dce52dfad985d862437770ad2eb702488d97cabff12eb00660a891f966792fa18758403292847a414f29181cea5132963',
      address: 'addr_test1qr4rcrvjv6ku7u8mdpz3ggesyszcz7uwc7jeyfl76jq23pamq0mk69u3s0ycx8hj8d29gd50nlrzzthn5nfn7p37r5ssaxgcuh',
    },
    receivingWallet: {
      mnemonic: 'blush pink elegant aspect panda other inspire color consider dinosaur symptom cave try boring panda idle have nurse toss luggage busy risk surprise engage',
      publicKey: 'a713e4c1aa4013662635a06214a85c5236163f789e0a70b62b4bfcb589f2bfae8b65db531c2f5f8e287ac39a39b1616cdf02fde94aa59715259c238547b45c11',
      address: 'addr_test1qzhnx7a40pz54h2lheylvevgplxd29xlfhnca3xnef8hj7mne6zkv6w5tsvy93yehsad5wwudvlqhva58j6jk0eur0wsf3lekl',
    },
    subscribe_message_schema:
      expect.arrayContaining([{
        address: expect.stringMatching(/^addr_test[a-zA-Z0-9]+$/),
        txData: {
          hash: expect.stringMatching(/^[a-f0-9]{64}$/),
          block: expect.stringMatching(/^[a-f0-9]{64}$/),
          block_height: expect.any(Number),
          block_time: expect.any(Number),
          slot: expect.any(Number),
          index: expect.any(Number),
          output_amount: expect.arrayContaining([
            {
              unit: expect.any(String),
              quantity: expect.any(String),
              decimals: expect.any(Number),
            },
          ]),
          fees: expect.any(String),
          deposit: expect.any(String),
          size: expect.any(Number),
          invalid_before: expect.toBeOneOf([null, expect.any(String)]),
          invalid_hereafter: expect.toBeOneOf([null, expect.any(String)]),
          utxo_count: expect.any(Number),
          withdrawal_count: expect.any(Number),
          mir_cert_count: expect.any(Number),
          delegation_count: expect.any(Number),
          stake_cert_count: expect.any(Number),
          pool_update_count: expect.any(Number),
          pool_retire_count: expect.any(Number),
          asset_mint_or_burn_count: expect.any(Number),
          redeemer_count: expect.any(Number),
          valid_contract: expect.any(Boolean),
        },
        txUtxos: {
          hash: expect.stringMatching(/^[a-f0-9]{64}$/),
          inputs: expect.arrayContaining([
            {
              address: expect.stringMatching(/^addr_test[a-zA-Z0-9]+$/),
              amount: expect.arrayContaining([
                {
                  unit: expect.any(String),
                  quantity: expect.any(String),
                  decimals: expect.any(Number),
                },
              ]),
              tx_hash: expect.stringMatching(/^[a-f0-9]{64}$/),
              output_index: expect.any(Number),
              data_hash: expect.toBeOneOf([null, expect.stringMatching(/^[a-f0-9]{64}$/)]),
              inline_datum: expect.toBeOneOf([null, expect.any(String)]),
              reference_script_hash: expect.toBeOneOf([null, expect.stringMatching(/^[a-f0-9]{64}$/)]),
              collateral: expect.any(Boolean),
              reference: expect.any(Boolean),
            },
          ]),
          outputs: expect.arrayContaining([
            {
              address: expect.stringMatching(/^addr_test[a-zA-Z0-9]+$/),
              amount: expect.arrayContaining([
                {
                  unit: expect.any(String),
                  quantity: expect.any(String),
                  decimals: expect.any(Number),
                },
              ]),
              output_index: expect.any(Number),
              data_hash: expect.toBeOneOf([null, expect.stringMatching(/^[a-f0-9]{64}$/)]),
              inline_datum: expect.toBeOneOf([null, expect.any(String)]),
              collateral: expect.any(Boolean),
              reference_script_hash: expect.toBeOneOf([null, expect.stringMatching(/^[a-f0-9]{64}$/)]),
              consumed_by_tx: expect.toBeOneOf([null, expect.stringMatching(/^[a-f0-9]{64}$/)]),
            },
          ]),
        },
        txHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      }]),
  },
] as const;
