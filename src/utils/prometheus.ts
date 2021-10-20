export const jsonToPrometheus = (metrics: Record<string, unknown>): string => {
  let output = '';
  Object.entries(metrics).forEach(([key, value]) => {
    output += `${key} ${value}\n`;
  });
  return output;
};
