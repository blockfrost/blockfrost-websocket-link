import estimateFee from '../../../../src/methods/estimateFee';

describe('methods', () => {
  it('estimateFee', async () => {
    const result = await estimateFee(1);
    expect(result).toBe({ lovelacePerByte: 44 });
  });

  it('estimateFee', async () => {
    const result = await estimateFee(1);
    expect(result).toBe({ lovelacePerByte: 44 });
  });

  it('estimateFee', async () => {
    const result = await estimateFee(1);
    expect(result).toBe({ lovelacePerByte: 44 });
  });

  it('estimateFee', async () => {
    const result = await estimateFee(1);
    expect(result).toBe({ lovelacePerByte: 44 });
  });
});
