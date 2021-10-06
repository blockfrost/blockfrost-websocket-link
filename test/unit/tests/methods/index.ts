import estimateFee from '../../../../src/methods/estimateFee';

describe('methods', () => {
  it('estimateFee', async () => {
    const result = await estimateFee(1);
    expect(result).toBe(
      JSON.stringify({
        id: 1,
        type: 'message',
        data: { lovelacePerByte: 44 },
      }),
    );
  });
});
