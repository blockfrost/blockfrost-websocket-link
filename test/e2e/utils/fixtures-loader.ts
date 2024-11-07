export const getFixtures = async (fixtureTestName: string) => {
  try {
    const fixtures = await import(
      `../fixtures/${process.env.BLOCKFROST_NETWORK}/${fixtureTestName}.e2e.ts`
    );

    return fixtures.default;
  } catch (error) {
    throw new Error(`Error loading fixtures: ${error}`);
  }
};
