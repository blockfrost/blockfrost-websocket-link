export const paginate = (input: any[], size: number): any[][] => {
  return input.reduce((ac, val, i) => {
    const id = Math.floor(i / size);
    const page = ac[id] || (ac[id] = []);
    page.push(val);
    return ac;
  }, []);
};
