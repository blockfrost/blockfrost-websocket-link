export const getFixtures = async (testType: string) => {
  try {
    const fixtures = await import(
      `../fixtures/${process.env.BLOCKFROST_NETWORK}/${testType}.e2e.ts`
    );

    return fixtures.default;
  } catch (error) {
    throw new Error(`Error loading fixtures: ${error}`);
  }
};
