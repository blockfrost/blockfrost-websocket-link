export const prepareMessage = (message: string, payload: any): string => {
  return JSON.stringify({ message, payload });
};
