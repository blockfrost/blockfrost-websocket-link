export const paginate = <T>(items: T[], pageSize: number): T[][] => {
  // eslint-disable-next-line unicorn/no-array-reduce
  return items.reduce((ac, value, index) => {
    const id = Math.floor(index / pageSize);
    const page = ac[id] || (ac[id] = []);

    page.push(value);
    return ac;
  }, [] as T[][]);
};

export const promiseTimeout = <T>(promise: T, ms: number) => {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((_resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject(new Error('PROMISE_TIMEOUT'));
    }, ms);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
};
