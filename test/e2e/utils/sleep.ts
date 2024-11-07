export const sleep = (delayMs: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, delayMs);
  });
};
