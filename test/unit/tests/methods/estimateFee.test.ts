import estimateFee from '../../../../src/methods/estimateFee';

describe('estimateFee', () => {
  test('success', async () => {
    const res = await estimateFee(1);

    expect(res).toBe(
      JSON.stringify({
        id: 1,
        type: 'message',
        data: {
          lovelacePerByte: 44,
        },
      }),
    );
  });
});
